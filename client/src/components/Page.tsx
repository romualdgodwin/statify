import { PropsWithChildren } from "react";
import { Footer } from "./Footer";
import { Header } from "./Header";

export type PageProps = {
  title: string;
};

export const Page = ({ title, children }: PropsWithChildren<PageProps>) => {
  return (
    <>
      <Header title={title} />
      {children}
      <Footer />
    </>
  );
};
