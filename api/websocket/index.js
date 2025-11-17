// websocket/index.js
import { Server } from "socket.io";

let io = null;

/**
 * 初始化 Socket.IO WebSocket 伺服器
 * 
 * @param {http.Server} server - Node.js 建立的 HTTP 伺服器實例
 * @returns {Server} - 回傳已初始化的 Socket.IO 伺服器
 */
export const initWebSocket = (server) => {
  /**
   * 建立 Socket.IO 伺服器並設定基本參數
   * - CORS：限制允許的前端來源
   * - pingInterval：伺服器發送內建 ping 的頻率（毫秒）
   * - pingTimeout：若在此時間內未收到 pong，即視為斷線
   * - transports：傳輸協定（websocket 為主，polling 為備援）
   */
  io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 10000,
    transports: ["websocket", "polling"],
  });

   console.log("[WebSocket] WebSocket 伺服器初始化成功");

  /**
   * 使用者成功建立連線時觸發
   * @param {import('socket.io').Socket} socket - 當前使用者的連線物件
   */
  io.on("connection", (socket) => {
    /**
     * 接收客戶端自訂 ping 測試事件
     * 前端可用 socket.emit("ping-server", data)
     * 用於測試 WebSocket 雙向通訊是否正常
     */

    console.log(`[WebSocket] 有使用者連線：${socket.id}`);

    socket.on("ping-server", (data) => {
      socket.emit("pong-server", `伺服器回覆：${data}`);
    });

    /**
     * 自訂應用層心跳事件
     * 前端可每隔固定時間送出 "heartbeat"
     * 伺服器收到後更新最後心跳時間並回覆
     */
    socket.on("heartbeat", () => {
      socket.lastHeartbeat = Date.now();
      socket.emit("heartbeat-ack", { ts: socket.lastHeartbeat });
    });

    /**
     * 錯誤事件監聽
     * 若連線或傳輸過程中發生異常會觸發
     */
    socket.on("error", (err) => {
       console.error(`[WebSocket] 連線錯誤：${socket.id}`, err);
    });

    /**
     * 斷線事件監聽
     * 前端關閉、網路中斷、超時皆會觸發
     */
    socket.on("disconnect", (reason) => {
      // 可在此釋放使用者資源或更新狀態
      console.log(`[WebSocket] 使用者斷線：${socket.id}，原因：${reason}`);
    });

    /**
     * 自動重連監控
     * 前端開啟 autoReconnect 時，每次重試都會觸發
     */
    socket.on("reconnect_attempt", (attemptNumber) => {
      // 可在此紀錄重連次數或警告使用者
      console.log(`[WebSocket] 使用者嘗試重連 (${attemptNumber})：${socket.id}`);
    });
  });

  return io;
};

/**
 * 取得已初始化的 Socket.IO 伺服器實例
 * 若尚未初始化會拋出錯誤
 * 
 * @returns {Server} - Socket.IO 伺服器實例
 */
export const getIO = () => {
  if (!io) throw new Error("Socket.IO 尚未初始化！");
  return io;
};
