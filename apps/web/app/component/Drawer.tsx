"use client";
import { useEffect, useRef, useState } from "react";
import { HexColorPicker } from "react-colorful";

export const Drawer = () => {
  const isDrawer = useRef<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevPoint = useRef({ x: 0, y: 0 });
  const currPoint = useRef({ x: 0, y: 0 });
  const currentStroke = useRef<{ x: number; y: number }[]>([]);
  const [bgColor, setBgColor] = useState("#008000");
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("there is no canvas.");
      return;
    }

    const mouseDownHanlder = (e: MouseEvent) => {
      isDrawer.current = true;
      mouseMoveHandler(e);
    };

    const mouseMoveHandler = (e: MouseEvent) => {
      const canvasStyle = canvas?.getContext("2d");
      mouseMovment(e);
      console.log(isDrawer);
      if (!canvasStyle || !isDrawer.current) {
        console.log("no canvas or you cannot draw");
        return;
      }
      canvasStyle.strokeStyle = bgColor;
      canvasStyle.lineWidth = 6;
      canvasStyle.lineCap = "round";
      canvasStyle.lineJoin = "round";
      canvasStyle.beginPath();
      canvasStyle.moveTo(prevPoint.current.x, prevPoint.current.y);
      canvasStyle.lineTo(currPoint.current.x, currPoint.current.y);
      canvasStyle.stroke();
    };

    const mouseMovment = (e: MouseEvent) => {
      if (!canvas) {
        console.log("either canvas or isDrawer is null");
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / canvas.clientWidth;
      const scaleY = canvas.height / canvas.clientHeight;
      prevPoint.current.x = currPoint.current.x;
      prevPoint.current.y = currPoint.current.y;
      currPoint.current.x = (e.clientX - rect.left) * scaleX;
      currPoint.current.y = (e.clientY - rect.top) * scaleY;
      currentStroke.current.push({
        x: currPoint.current.x,
        y: currPoint.current.y,
      });
      console.log("previous", prevPoint.current.x, prevPoint.current.y);
      console.log("current", currPoint.current.x, currPoint.current.y);
    };

    const mouseUpHanlder = (e: MouseEvent) => {
      console.log("hgsdd");
      isDrawer.current = false;
    };

    const mouseLeaveHanlder = (e: MouseEvent) => {
      isDrawer.current = false;
    };
             
    canvas.addEventListener("mousedown", mouseDownHanlder);
    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mouseup", mouseUpHanlder);
    canvas.addEventListener("mouseleave", mouseLeaveHanlder);

    return () => {
      canvas.removeEventListener("mousedown", mouseDownHanlder);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("mouseup", mouseUpHanlder);
      canvas.removeEventListener("mouseleave", mouseLeaveHanlder);
    };
  }, []);

  return (
    <div className="bg-black h-screen flex items-center justify-center">
      <HexColorPicker
        color={bgColor}
        onChange={setBgColor}
        className="w-48 h-48"
      />
      <canvas
        className="bg-white border border-gray-300 shadow-lg"
        width={800}
        height={600}
        ref={canvasRef}
      />
    </div>
  );
};
