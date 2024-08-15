import { Component, createSignal, onCleanup } from "solid-js";
import styles from "./styles.module.css"


interface ButtonProps {
    showDelete : boolean;
    onClickAdd : (numberInputs : number, numberOutputs : number) => void;
    onClickDelete : () => void;
}

function clickOutside(el: any,accessor: any){
    const onClick = (e: any) => !el.contains(e.target) && accessor()?.();
    document.body.addEventListener("click", onClick);
    onCleanup(() => document.body.removeEventListener("click", onClick));
}

const ButtonComponent : Component<ButtonProps> = (props : ButtonProps) => {
    const [isOpen, SetIsOpen] = createSignal<boolean>(false);
    const [numberInputs, SetNumberInputs] = createSignal<number>(0);
    const [numberOutputs, SetNumberOutputs] = createSignal<number>(0);

    function handleOnClickAddNode(event : any){
        event.stopPropagation();
        if(numberInputs() > 4 || numberInputs() < 0 || numberOutputs() > 4 || numberOutputs() < 0){ return;}
        SetIsOpen(false);
        props.onClickAdd(numberInputs(), numberOutputs());
        SetNumberInputs(0);
        SetNumberOutputs(0);
    }
    function handleChangeNumberInputs(event : any){
        SetNumberInputs(event.target.value);
    }
    function handleChangeNumberOutputs(event : any){
        SetNumberOutputs(event.target.value);
    }
    function handleOnClickAdd(event : any){
        event.stopPropagation();
        SetIsOpen(true);
    }
    function handleClickOutsideDropdown(){
        SetNumberInputs(0);
        SetNumberOutputs(0);
        SetIsOpen(false);
    }

    return <div class={styles.wrapper}>
        <button class={props.showDelete ? styles.buttonDelete : styles.buttonDeleteHidden} onClick={props.onClickDelete}>
        <svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" style="overflow: visible; color: currentcolor;"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"></path><path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"></path></svg>
        </button>
        <button class={styles.buttonAdd} onclick={handleOnClickAdd}>
        <svg fill="currentColor" stroke-width="0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="1em" width="1em" style="overflow: visible; color: currentcolor;"><path d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"></path></svg>
        </button>
        <div class={isOpen() ? styles.dropdown : styles.dropdownHidden}
        //@ts-ignore
        use:clickOutside={handleClickOutsideDropdown}
        >
            <label class={styles.lable}>Number of inputs</label>
            <input type="number" class={styles.input} value={numberInputs()} onInput={handleChangeNumberInputs}/>
            <label class={styles.lable}>Number of outputs</label>
            <input type="number" class={styles.input} value={numberOutputs()} onInput={handleChangeNumberOutputs}/>
            <button class={styles.buttonRect} onclick={handleOnClickAddNode}>Add Node</button>
        </div>
    </div>
}

export default ButtonComponent;