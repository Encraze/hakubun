import { createElement } from "react";
import { toHiragana } from "wanakana";

const translateInputValue = (string: string, translateToHiragana: boolean) => {
  if (translateToHiragana) {
    return toHiragana(string, { IMEMode: true });
  }
  return string;
};

type Props = {
  [key: string]: any;
  value: string;
  onChange: (e: any) => void;
  translateToHiragana: boolean;
  inputRef: React.MutableRefObject<
    HTMLInputElement | HTMLTextAreaElement | null
  >;
  elementType?: "input" | "textarea";
};

function WanakanaInput({
  value,
  inputRef,
  onChange,
  translateToHiragana,
  elementType = "input",
  ...props
}: Props) {
  const translatedVal = translateInputValue(value, translateToHiragana);

  const handleChange = (e: any) => {
    let updatedValue = translateInputValue(e.target.value, translateToHiragana);
    inputRef.current.value = updatedValue;
    onChange(e);
  };

  return createElement(elementType, {
    ref: inputRef,
    value: translatedVal,
    onChange: handleChange,
    autoCorrect: "off",
    autoCapitalize: "none",
    "data-testid": "wanakana-input",
    ...props,
  });
}

export default WanakanaInput;
