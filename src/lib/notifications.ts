/**
 * 通知接口（占位）—— 暂时只写 console.log。
 *
 * 点解唔喺呢度直接读飞书密钥：
 *   呢个文件会被浏览器端 import。飞书 app secret 係服务端 secret，
 *   绝对唔可以经过 `import.meta.env.VITE_*` 打进前端 bundle（Vite 会把
 *   VITE_ 前缀嘅变量字面替换进产物，等于公开发咗密钥）。
 *   所有真正嘅飞书调用都放喺 src/server/legacy/*（服务端 Worker），
 *   密钥只经由 env / context.env 读取。
 *
 * 如果之后要真发微信通知：喺服务端加一条 API（例如 /api/public/notify），
 * 由服务端读 FEISHU_APP_SECRET 去调飞书 / 微信，唔好喺浏览器直接调。
 */

export async function sendWeChatNotification(bookingId: string, phone: string): Promise<void> {
  // 实现微信通知逻辑
  console.log('Sending WeChat notification:', { bookingId, phone });
}

/** 发送状态更新通知 */
export async function sendStatusUpdate(bookingId: string, message: string, phone: string): Promise<void> {
  console.log('Sending status update:', { bookingId, message, phone });
}
