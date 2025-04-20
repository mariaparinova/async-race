import './Button.styles.css';

export interface ButtonProps {
  classes?: string[];
  isPrimary?: boolean;
  text: string;
  onClick: (event: Event) => void;
  isDisabled?: boolean;
}

export function Button(props: ButtonProps) {
  const { classes, isPrimary = false, text, onClick, isDisabled = false } = props;

  let classNames = 'btn';
  classNames += isPrimary ? ' primary ' : ' secondary ';
  classNames += classes?.join(' ') || '';

  const btnEl = document.createElement('button');
  btnEl.disabled = isDisabled;
  btnEl.className = classNames;
  btnEl.innerText = text;
  btnEl.onclick = (event) => event.preventDefault();

  if (onClick) {
    btnEl.addEventListener('click', onClick);
  }

  return btnEl;
}

export default Button;
