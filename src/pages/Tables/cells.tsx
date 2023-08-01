import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function HeaderCell({ children }: Props) {
  return <th className="header-cell">{children}</th>;
}

export function ButtonsHeaderCell() {
  return <th className="buttons-header-cell"></th>;
}

export function BodyCell({ children }: Props) {
  return <td className="body-cell">{children}</td>;
}

export function BodyButtonCell({ children }: Props) {
  return <td className="body-button-cell">{children}</td>;
}

