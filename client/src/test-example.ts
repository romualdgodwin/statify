import axios from "axios";

export const myFunctionToTest = (a: number, b: number): number => {
  return a + b;
};

type User = {
  name: string;
  age: number;
};

const users = [
  { name: "John", age: 30 },
  { name: "Jane", age: 25 },
];

export const filterUsers = (filter: (user: User) => boolean): User[] =>
  users.filter(filter);

export const axiosExample = async () => {
  const result = await axios.get("https://jsonplaceholder.typicode.com/posts");
  return result.data.find((post: any) => post.id === 1).userId;
};
