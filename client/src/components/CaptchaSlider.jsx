import React, { useEffect, useRef, useState } from "react";
import { request } from "../utils/apiService";
import { toast } from "react-toastify";
import "./captchaSlider.scss";

const CaptchaSlider = ({ onPass }) => {
    const canvasRef = useRef(null);

    // 常數設定
    const canvasWidth = 300;
    const canvasHeight = 150;
    const pieceSize = 40;
    const pieceTop = 55;

    const [bgImgUrl] = useState("/cup250.jpg");
    const [captchaToken, setCaptchaToken] = useState("");
    const [targetX, setTargetX] = useState(0); // 缺口左邊界
    const [dragX, setDragX] = useState(pieceSize / 2);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    // 初始化 Captcha
    useEffect(() => {
        const initCaptcha = async () => {
            const res = await request("GET", "/captcha/initCaptcha");
            if (res.success) {
                setCaptchaToken(res.data.token);
                setTargetX(res.data.targetX);
                setDragX(pieceSize / 2); 
            } else {
                toast.error("驗證初始化失敗");
            }
        };
        initCaptcha();
    }, []);

    // 畫背景與缺口 + 十字線
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

                // 畫缺口（圓心）
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

    // 拖曳邏輯
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
            const offset = clientX - startX;
            const clamped = Math.max(pieceSize / 2, Math.min(offset, canvasWidth - pieceSize / 2));
            setDragX(clamped); // 圓心座標
        };

        const handleMouseUp = async () => {
            if (!isDragging) return;
            setIsDragging(false);

            const res = await request("POST", "/captcha/verifyCaptcha", {
                token: captchaToken,
                userX: dragX, // 傳圓心
            });

            if (res.success) {
                toast.success("驗證成功！");
                onPass?.();
            } else {
                toast.error("驗證失敗，請重試");
                setDragX(canvasWidth / 2); // 重置位置
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
        const sliderLeft = dragX - pieceSize / 2;
        setStartX(clientX - sliderLeft);
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
                onMouseDown={handleStart}
                onTouchStart={handleStart}
                style={{
                    left: `${dragX - pieceSize / 2}px`,
                    top: `${pieceTop}px`,
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
