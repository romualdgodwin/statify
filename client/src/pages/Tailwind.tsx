import { Page } from "../components/Page";

export const Tailwind = () => {
  return (
    <Page title="Tailwind">
      <div className="border-1 border-black rounded-xl p-4">
        <label className="input">
          <input type="search" className="grow" placeholder="Login" />
        </label>
        <div className="gap-4 flex">
          <span>Password :</span>
          <input type="text" />
        </div>
      </div>
    </Page>
  );
};
