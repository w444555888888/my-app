import React, { useEffect, useState } from "react";
import SliderCaptcha from "rc-slider-captcha";
import { request } from "../utils/apiService";
import { toast } from "react-toastify";

const CaptchaSlider = ({ onPass, onFail }) => {
  const [captchaToken, setCaptchaToken] = useState("");
  const [bgImgUrl, setBgImgUrl] = useState("");
  const [puzzleImgUrl, setPuzzleImgUrl] = useState("");
  const [ready, setReady] = useState(false);

  // 初始化驗證資訊
  useEffect(() => {
    const initCaptcha = async () => {
      const res = await request("GET", "/captcha/initCaptcha");
      if (res.success) {
        // 隨機選圖片
        const imgs = ["/captchaSlider1.jpg", "/captchaSlider2.jpg"];
        const randomBg = imgs[Math.floor(Math.random() * imgs.length)];

        setCaptchaToken(res.data.token);
        const { puzzleBase64, bgWithHole } = await createPuzzleFromBg(
          randomBg,
          res.data.targetX
        );

        setBgImgUrl(bgWithHole); // 有缺口的背景圖
        setPuzzleImgUrl(puzzleBase64); // 拼圖塊
        setReady(true);
      } else {
        toast.error(res.message || "驗證初始化失敗");
      }
    };

    initCaptcha();
  }, []);

  /**
   * @滑塊驗證處理 data
   * x: 用戶拖曳後的滑塊實際 X 位置
   * y: y: 用戶拖曳後的 Y（
   * sliderOffsetX: 滑塊元素本身的偏移量
   */
  const handleVerify = async (data) => {
    const { x } = data; // data = { x: number, y: number, sliderOffsetX: number }
    const res = await request("POST", "/captcha/verifyCaptcha", {
      token: captchaToken,
      userX: x,
    });

    if (res.success) {
      toast.success("驗證成功！");
      onPass?.();
      return Promise.resolve();
    } else {
      toast.error(res.message || "驗證失敗，請重試");
      onFail?.();
      return Promise.reject();
    }
  };

  const createPuzzleFromBg = (bgUrl, targetX) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = bgUrl;

      img.onload = () => {
        const bgWidth = 400; // 你的背景寬度
        const bgHeight = 200; // 你的背景高度
        const puzzleWidth = 50; // 拼圖塊寬度（滑塊寬度）
        const puzzleHeight = bgHeight; // 高度延伸到底

        // 1. 裁剪拼圖塊（長條形）
        const puzzleCanvas = document.createElement("canvas");
        puzzleCanvas.width = puzzleWidth;
        puzzleCanvas.height = puzzleHeight;
        const puzzleCtx = puzzleCanvas.getContext("2d");

        // 直接裁剪整個高度的長條形區域
        puzzleCtx.drawImage(
          img,
          targetX * (img.width / bgWidth), // 換算成原圖座標
          0,
          puzzleWidth * (img.width / bgWidth),
          img.height,
          0,
          0,
          puzzleWidth,
          puzzleHeight
        );

        const puzzleBase64 = puzzleCanvas.toDataURL("image/png");

        // 2. 在背景圖上挖缺口（長條形透明區域）
        const bgCanvas = document.createElement("canvas");
        bgCanvas.width = bgWidth;
        bgCanvas.height = bgHeight;
        const bgCtx = bgCanvas.getContext("2d");

        bgCtx.drawImage(img, 0, 0, bgWidth, bgHeight);

        // 挖缺口：整個高，從 targetX 開始，寬 puzzleWidth
        bgCtx.clearRect(targetX, 0, puzzleWidth, puzzleHeight);

        const bgWithHole = bgCanvas.toDataURL("image/png");

        resolve({ puzzleBase64, bgWithHole });
      };
    });
  };

  return (
    <div style={{ width: 400, margin: "0 auto" }}>
      {ready && (
        <SliderCaptcha
          request={async () => ({
            bgUrl: bgImgUrl,
            puzzleUrl: puzzleImgUrl,
          })}
          onVerify={handleVerify}
          bgSize={{ width: 400, height: 200 }}
          puzzleSize={{ width: 50 }} // 高度自動等於背景高
          tipText={{
            default: "請拖動滑塊完成驗證",
            success: "驗證成功",
            error: "驗證失敗",
          }}
        />
      )}
    </div>
  );
};

export default CaptchaSlider;
