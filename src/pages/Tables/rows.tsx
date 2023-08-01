import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export function TableBody({ children }: Props) {
  return <tbody className="table-body">{children}</tbody>;
}
