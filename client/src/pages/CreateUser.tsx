import { Button, Form } from "react-bootstrap";
import { Page } from "../components/Page";

export const CreateUser = () => {
  return (
    <Page title="Create User">
      <Form>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="Enter email" />
        </Form.Group>
        <Form.Group>
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Form.Group>
        <Form.Group>
          <Form.Check type="checkbox" label="Admin" />
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </Page>
  );
};
