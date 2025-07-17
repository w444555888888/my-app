import React, { useEffect, useRef, useState } from "react";
import { request } from "../utils/apiService";
import { toast } from "react-toastify";
import "./captchaSlider.scss";

const CaptchaSlider = ({ onPass }) => {
  const canvasRef = useRef(null);
  const pieceRef = useRef(null);

  // 常數統一設定
  const canvasHeight = 150;
  const canvasWidth = 300;
  const pieceSize = 40;
  const pieceTop = 55;

  const [bgImgUrl] = useState("/cup250.jpg");
  const [captchaToken, setCaptchaToken] = useState("");
  const [targetX, setTargetX] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  // 初始化 Captcha
  useEffect(() => {
    const initCaptcha = async () => {
      const res = await request("GET", "/captcha/initCaptcha");
      if (res.success) {
        setCaptchaToken(res.data.token);
        setTargetX(res.data.targetX);
      } else {
        toast.error("驗證初始化失敗");
      }
    };
    initCaptcha();
  }, []);

  // 繪製背景與圓形缺口
  useEffect(() => {
    const drawPuzzle = () => {
      if (!targetX || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = bgImgUrl;

      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();
        ctx.arc(targetX + pieceSize / 2, pieceTop + pieceSize / 2, pieceSize / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
    };
    drawPuzzle();
  }, [targetX, bgImgUrl]);

  // 拖曳驗證邏輯
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
      const offset = clientX - startX;
      const clamped = Math.max(0, Math.min(offset, canvasWidth - pieceSize));
      setDragX(clamped);
    };

    const handleMouseUp = async () => {
      if (!isDragging) return;
      setIsDragging(false);

      const res = await request("POST", "/captcha/verifyCaptcha", {
        token: captchaToken,
        userX: dragX,
      });

      if (res.success) {
        toast.success("驗證成功！");
        onPass?.();
      } else {
        toast.error("驗證失敗，請重試");
        setDragX(0);
      }

      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMouseMove);
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMouseMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, startX, dragX, captchaToken, onPass]);

  const handleStart = (e) => {
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    setStartX(clientX - dragX);
    setIsDragging(true);
  };

  return (
    <div className="captcha-slider">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="captcha-bg"
      />
      <div
        className="slider-piece"
        ref={pieceRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        style={{
          top: `${pieceTop}px`,
          left: `${dragX}px`,
          width: `${pieceSize}px`,
          height: `${pieceSize}px`,
          backgroundImage: `url(${bgImgUrl})`,
          backgroundPosition: `-${targetX}px -${pieceTop}px`,
          backgroundSize: `${canvasWidth}px ${canvasHeight}px`,
        }}
      />
    </div>
  );
};

export default CaptchaSlider;
