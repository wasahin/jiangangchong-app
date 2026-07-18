#!/usr/bin/env node
/**
 * 自动轮询 GitHub Actions 和 Cloudflare Pages 部署状态
 * 直到部署完成或失败
 *
 * 用法:
 *   node scripts/poll-deployment.mjs
 *   node scripts/poll-deployment.mjs --run-id 123456  (跟踪指定 run)
 *   node scripts/poll-deployment.mjs --no-cloudflare  (只查 GitHub)
 *
 * 环境变量 (可选, 也可在脚本中直接修改):
 *   GITHUB_TOKEN          - GitHub Personal Access Token
 *   GITHUB_REPO           - GitHub 仓库 (owner/repo), 默认 wasahin/jiangangchong-app
 *   CLOUDFLARE_API_TOKEN  - Cloudflare API Token
 *   CLOUDFLARE_ACCOUNT_ID - Cloudflare Account ID
 *   CLOUDFLARE_PROJECT    - Cloudflare Pages 项目名, 默认 jingangchong-app
 *   POLL_INTERVAL         - 轮询间隔 (秒), 默认 15
 */

// Windows 控制台 UTF-8 支持
if (process.platform === 'win32') {
  try {
    process.stdout.setDefaultEncoding('utf8');
    process.stderr.setDefaultEncoding('utf8');
  } catch (e) {}
}

// 解析命令行参数
const args = process.argv.slice(2);
const runIdArg = args.includes('--run-id') ? args[args.indexOf('--run-id') + 1] : null;
const skipCloudflare = args.includes('--no-cloudflare');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'wasahin/jiangangchong-app';
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CLOUDFLARE_PROJECT = process.env.CLOUDFLARE_PROJECT || 'jingangchong-app';
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL || '15', 10) * 1000;

// ANSI 颜色
const c = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

const log = (msg) => console.log(msg);
const err = (msg) => console.error(`${c.red}${msg}${c.reset}`);

async function githubApi(path, useAuth = true) {
  const url = path.startsWith('http') ? path : `https://api.github.com/repos/${GITHUB_REPO}/${path}`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'poll-deployment-script',
  };
  if (useAuth && GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (res.status === 403) {
    const body = await res.json().catch(() => ({}));
    if (body.message && body.message.includes('rate limit')) {
      throw new Error('GitHub API 限流, 请稍后重试或使用 token 认证');
    }
    throw new Error(`GitHub API 403: ${body.message || 'Forbidden'}`);
  }
  if (res.status === 401) {
    throw new Error('GitHub token 无效或已过期');
  }
  if (res.status === 404 && useAuth && GITHUB_TOKEN) {
    // token 可能失效, 尝试无认证访问 (公共仓库)
    return githubApi(path, false);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`GitHub API ${res.status}: ${body.message || res.statusText}`);
  }
  return res.json();
}

async function cloudflareApi(path) {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    return null;
  }
  const res = await fetch(`https://api.cloudflare.com/client/v4/${path}`, {
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(`Cloudflare API ${res.status}: ${body.errors?.[0]?.message || res.statusText}`);
  }
  return res.json();
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function stepIcon(status, conclusion) {
  if (status === 'completed') {
    if (conclusion === 'success') return `${c.green}✓${c.reset}`;
    if (conclusion === 'failure') return `${c.red}✗${c.reset}`;
    if (conclusion === 'skipped') return `${c.gray}○${c.reset}`;
    if (conclusion === 'cancelled') return `${c.gray}⊘${c.reset}`;
    return `${c.yellow}?${c.reset}`;
  }
  if (status === 'in_progress') return `${c.blue}●${c.reset}`;
  if (status === 'queued') return `${c.gray}⋯${c.reset}`;
  return `${c.gray}·${c.reset}`;
}

async function checkGitHubActions(runId) {
  // 获取最新的一次运行
  let run;
  if (runId) {
    run = await githubApi(`actions/runs/${runId}`);
  } else {
    const data = await githubApi('actions/runs?per_page=1');
    if (!data.workflow_runs || data.workflow_runs.length === 0) {
      return { found: false };
    }
    run = data.workflow_runs[0];
  }

  // 获取 jobs - jobs_url 是完整 URL, 直接传给 githubApi
  const jobsPath = run.jobs_url.replace(`https://api.github.com/repos/${GITHUB_REPO}/`, '');
  const jobsData = await githubApi(jobsPath);
  const job = jobsData.jobs && jobsData.jobs[0];

  const steps = job ? job.steps.map((s) => ({
    name: s.name,
    status: s.status,
    conclusion: s.conclusion,
  })) : [];

  return {
    found: true,
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    html_url: run.html_url,
    display_title: run.display_title,
    created_at: run.created_at,
    updated_at: run.updated_at,
    steps,
  };
}

async function checkCloudflarePages() {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID) {
    return { available: false };
  }
  try {
    const data = await cloudflareApi(`accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${CLOUDFLARE_PROJECT}/deployments?per_page=3`);
    if (!data.success || !data.result || data.result.length === 0) {
      return { available: true, deployments: [] };
    }
    const deployments = data.result.map((d) => ({
      id: d.id,
      environment: d.environment,
      latest_stage: d.latest_stage,
      stages: d.stages,
      created_on: d.created_on,
      modified_on: d.modified_on,
      deployment_url: d.url,
      alias: d.alias,
      is_skipped: d.is_skipped,
    }));
    return { available: true, deployments };
  } catch (e) {
    return { available: true, error: e.message };
  }
}

function printGitHubStatus(gh) {
  if (!gh.found) {
    log(`${c.gray}  GitHub Actions: 暂无运行记录${c.reset}`);
    return;
  }
  const statusBadge =
    gh.status === 'completed'
      ? gh.conclusion === 'success'
        ? `${c.green}✓ 成功${c.reset}`
        : gh.conclusion === 'failure'
        ? `${c.red}✗ 失败${c.reset}`
        : gh.conclusion === 'cancelled'
        ? `${c.gray}⊘ 已取消${c.reset}`
        : `${c.yellow}? ${gh.conclusion}${c.reset}`
      : gh.status === 'in_progress'
      ? `${c.blue}● 进行中${c.reset}`
      : `${c.gray}⋯ ${gh.status}${c.reset}`;

  log(`${c.bold}[GitHub Actions]${c.reset} ${gh.display_title || gh.name}`);
  log(`  状态: ${statusBadge}`);
  log(`  运行ID: ${c.gray}${gh.id}${c.reset}`);
  log(`  链接: ${c.blue}${gh.html_url}${c.reset}`);

  if (gh.steps.length > 0) {
    log(`  步骤:`);
    for (const step of gh.steps) {
      log(`    ${stepIcon(step.status, step.conclusion)} ${step.name} ${c.gray}(${step.status}${step.conclusion ? '/' + step.conclusion : ''})${c.reset}`);
    }
  }
}

function printCloudflareStatus(cf) {
  if (!cf.available) {
    log(`${c.gray}  [Cloudflare Pages] 未配置 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID, 跳过检查${c.reset}`);
    return;
  }
  if (cf.error) {
    log(`${c.bold}[Cloudflare Pages]${c.reset} ${c.red}查询失败: ${cf.error}${c.reset}`);
    return;
  }
  if (!cf.deployments || cf.deployments.length === 0) {
    log(`${c.bold}[Cloudflare Pages]${c.reset} ${c.gray}暂无部署记录${c.reset}`);
    return;
  }
  const latest = cf.deployments[0];
  const stage = latest.latest_stage;
  const statusBadge =
    stage && stage.status === 'success'
      ? `${c.green}✓ 成功${c.reset}`
      : stage && stage.status === 'failure'
      ? `${c.red}✗ 失败${c.reset}`
      : stage && (stage.status === 'active' || stage.status === 'queued')
      ? `${c.blue}● 进行中${c.reset}`
      : `${c.gray}⋯ ${stage?.status || '未知'}${c.reset}`;

  log(`${c.bold}[Cloudflare Pages]${c.reset} 项目: ${CLOUDFLARE_PROJECT}`);
  log(`  最新部署: ${statusBadge}`);
  if (stage) {
    log(`  当前阶段: ${stage.name} ${c.gray}(${stage.status})${c.reset}`);
  }
  if (latest.deployment_url) {
    log(`  URL: ${c.blue}https://${latest.deployment_url}${c.reset}`);
  }
  if (latest.stages && latest.stages.length > 0) {
    log(`  部署阶段:`);
    for (const s of latest.stages) {
      const icon = s.status === 'success' ? `${c.green}✓${c.reset}` : s.status === 'failure' ? `${c.red}✗${c.reset}` : s.status === 'active' || s.status === 'queued' ? `${c.blue}●${c.reset}` : `${c.gray}·${c.reset}`;
      log(`    ${icon} ${s.name} ${c.gray}(${s.status})${c.reset}`);
    }
  }
}

function isGitHubDone(gh) {
  return gh.found && gh.status === 'completed';
}

function isCloudflareDone(cf) {
  if (!cf.available || cf.error || !cf.deployments || cf.deployments.length === 0) {
    return false;
  }
  const stage = cf.deployments[0].latest_stage;
  return stage && (stage.status === 'success' || stage.status === 'failure');
}

async function main() {
  log(`${c.bold}${c.blue}========================================${c.reset}`);
  log(`${c.bold}  部署状态轮询脚本${c.reset}`);
  log(`${c.bold}${c.blue}========================================${c.reset}`);
  log(`GitHub 仓库: ${GITHUB_REPO}`);
  log(`Cloudflare 项目: ${CLOUDFLARE_PROJECT}`);
  log(`轮询间隔: ${POLL_INTERVAL / 1000}s`);
  if (!GITHUB_TOKEN) {
    log(`${c.yellow}警告: 未设置 GITHUB_TOKEN, 将使用无认证访问 (有速率限制)${c.reset}`);
  }
  log('');

  const startTime = Date.now();
  let iteration = 0;
  let ghDone = false;
  let ghFailed = false;
  let cfDone = skipCloudflare || !CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ACCOUNT_ID; // 没配置则视为已完成
  let cfFailed = false;

  while (!ghDone || !cfDone) {
    iteration++;
    const elapsed = (Date.now() - startTime) / 1000;
    log(`${c.gray}--- 第 ${iteration} 次检查 (${formatTime(elapsed)}) ---${c.reset}`);

    try {
      const gh = await checkGitHubActions(runIdArg);
      printGitHubStatus(gh);
      if (isGitHubDone(gh)) {
        ghDone = true;
        if (gh.conclusion !== 'success') {
          ghFailed = true;
          log(`${c.red}${c.bold}✗ GitHub Actions 部署失败!${c.reset}`);
        } else {
          log(`${c.green}${c.bold}✓ GitHub Actions 部署成功!${c.reset}`);
        }
      }
    } catch (e) {
      err(`GitHub 查询失败: ${e.message}`);
      ghDone = true; // 出错时退出避免无限循环
      ghFailed = true;
    }

    log('');

    if (!skipCloudflare && CLOUDFLARE_API_TOKEN && CLOUDFLARE_ACCOUNT_ID) {
      try {
        const cf = await checkCloudflarePages();
        printCloudflareStatus(cf);
        if (isCloudflareDone(cf)) {
          cfDone = true;
          if (cf.deployments[0].latest_stage.status === 'failure') {
            cfFailed = true;
            log(`${c.red}${c.bold}✗ Cloudflare Pages 部署失败!${c.reset}`);
          } else {
            log(`${c.green}${c.bold}✓ Cloudflare Pages 部署成功!${c.reset}`);
          }
        }
      } catch (e) {
        err(`Cloudflare 查询失败: ${e.message}`);
        cfDone = true;
      }
      log('');
    }

    if (ghDone && cfDone) {
      break;
    }

    log(`${c.gray}等待 ${POLL_INTERVAL / 1000}s 后再次检查...${c.reset}`);
    log('');
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  const totalTime = formatTime((Date.now() - startTime) / 1000);
  log('');
  log(`${c.bold}${c.blue}========================================${c.reset}`);
  log(`${c.bold}  轮询结束, 总耗时: ${totalTime}${c.reset}`);
  log(`${c.bold}${c.blue}========================================${c.reset}`);

  if (ghFailed || cfFailed) {
    process.exit(1);
  }
}

main().catch((e) => {
  err(`脚本异常: ${e.message}`);
  process.exit(1);
});
