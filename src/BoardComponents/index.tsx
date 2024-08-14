import { Component, createSignal, onMount } from "solid-js";

import styles from "./styles.module.css";

const BoardComponent : Component = () => {
    const [grabbingBoard, SetGrabbingBoard] = createSignal<boolean>(false);
    const [scale, SetScale] = createSignal<number>(1);
    const [clickedPosition, SetClickedPosition] = createSignal<{x : number, y : number}>({x:1, y:1});

    onMount(()=>{
        const boardElement = document.getElementById("board");
        if(boardElement){
            boardElement.addEventListener("wheel", (event) => {
                SetScale(scale() + event.deltaY * -0.005);
                SetScale(Math.min(Math.max(1, scale()), 2));
                boardElement.style.transform = `scale(${scale()})`;
                boardElement.style.marginTop = `${(scale() - 1) * 50}vh`;
                boardElement.style.marginLeft = `${(scale() - 1) * 50}vw`;
            }, { passive: false})
        }
    })

    function handleOnMouseDown(event : any){
        //console.log("mouse down")
        SetGrabbingBoard(true);
        SetClickedPosition({x: event.x, y: event.y});
    }
    function handleOnMouseUp(){
        //console.log("mouse up")
        SetGrabbingBoard(false);
        SetClickedPosition({x: -1, y: -1});
    }
    function handleOnMouseMove(event : any){
        //console.log("mouse move")
        if(clickedPosition().x >=0 && clickedPosition().y >=0){
            const deltaX = event.x - clickedPosition().x;
            const deltaY = event.y - clickedPosition().y;

            const boardWrapper = document.getElementById("boardWrapper");
            if(boardWrapper){
                boardWrapper.scrollBy(-deltaX, -deltaY);
                SetClickedPosition({x: event.x, y: event.y});
            }
        }
    }

    return <div id="boardWrapper" class={styles.wrapper}>
        <div id="board" class={grabbingBoard() ? styles.boardDragging : styles.board}
        onMouseDown={handleOnMouseDown}
        onMouseUp={handleOnMouseUp}
        onMouseMove={handleOnMouseMove}
        >
        </div>
    </div>;
}

export default BoardComponent;