import styles from "./index.module.css";

type ModalPreviewProps = {
    text?: string;
    button?: string;
};

export function ModalPreview({ text, button }: ModalPreviewProps) {
    return (
        <div className={styles.modalPreview}>
            <div className={styles.header}>
                <span className={styles.headerText}>Logo</span>
            </div>
            <p className={styles.text}>{text}</p>
            <button type="button" className={styles.button}>
                {button}
            </button>
        </div>
    );
}
