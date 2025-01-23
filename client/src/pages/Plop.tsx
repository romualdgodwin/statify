import { Button } from "react-bootstrap";
import "./Home.css";
import { Page } from "../components/Page";

export const Plop = () => {
  return (
    <Page title="Plop">
      <div className="card">Coucou !</div>
      <button>Without bootsrap</button>
      <button type="button" className="btn btn-danger">
        With bootstrap
      </button>
      <Button variant="warning">Plop</Button>
    </Page>
  );
};
