import './Input.styles.css';

interface InputProps {
  type?: string;
  id?: string;
  name?: string;
  labelText?: string;
  placeholder?: string;
  onClick?: () => void;
  onChange?: (event: Event) => void;
  onInput?: (event: Event) => void;
  onFocus?: (event: Event) => void;
  inputClassNames?: string;
  labelClassNames?: string;
  containerClassNames?: string;
  value?: string;
  isDisabled?: boolean;
  isRequired?: boolean;
  selectOptions?: string[];
}

export default function Input(props: InputProps) {
  const {
    type = 'text',
    id,
    name,
    labelText = '',
    placeholder,
    onClick,
    onChange,
    onInput,
    onFocus,
    inputClassNames = '',
    labelClassNames = '',
    containerClassNames = '',
    value,
    isDisabled = false,
    isRequired = false,
  } = props;

  const inputEl = document.createElement('input');
  inputEl.className = `input ${inputClassNames}`;
  inputEl.type = type;
  inputEl.disabled = isDisabled;
  inputEl.required = isRequired;

  const labelEl = document.createElement('label');
  labelEl.className = `label ${labelClassNames}`;
  labelEl.innerText = labelText;

  if (id) {
    inputEl.id = id;
    labelEl.htmlFor = id;
  }

  if (name) {
    inputEl.name = name;
  }

  if (placeholder) {
    inputEl.placeholder = placeholder;
  }

  if (onClick) {
    inputEl.onclick = onClick;
  }

  if (onChange) {
    inputEl.onchange = (event) => {
      onChange(event);
    };
  }

  if (onInput) {
    inputEl.oninput = (event) => {
      onInput(event);
    };
  }

  if (onFocus) {
    inputEl.onfocus = (event) => {
      onFocus(event);
    };
  }

  if (value) {
    inputEl.value = value;
  }

  const inputContainerEl = document.createElement('div');
  inputContainerEl.className = `input-container ${containerClassNames}`;
  inputContainerEl.append(inputEl, labelEl);

  return inputContainerEl;
}
