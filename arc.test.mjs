import { arc } from "./arc.mjs";
const testArc = arc({ adValidation: true });

/* 

let received = {
  mark: {
    coll: {
      id: 1,
      name: "John Doe",
      age: 30,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "12345",
      },
    },
  },
  contacts: [
    { type: "email", value: "john@example.com" },
    { type: "phone", value: "555-123-4567" },
  ],
};

// Expected schema to check in above data.
let expected = {
  type: "obj",
  name: "mark",
  childs: [
    {
      type: "obj",
      name: "coll",
      childs: [
        { type: "int", name: "id" },
        { type: "str", name: "name" },
        { type: "int", name: "age" },
        {
          type: "obj",
          name: "address",
          childs: [
            { type: "str", name: "street" },
            { type: "str", name: "city" },
            { type: "str", name: "state" },
          ],
        },
      ],
    },
  ],
};

*/

// Schema to validate (Received response from API or any object that need to check strictly
let received = {
  mark: {
    coll: {
      id: 1,
      name: "BJP",
      age: 30,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA",
        postalCode: "12345",
      },
    },
  },
  contacts: [
    { type: "email", value: "john@example.com" },
    { type: "phone", value: "555-123-4567" },
  ],
};

// Expected schema to check in above data.
let expected = {
  type: "obj",
  name: "mark",
  childs: [
    {
      type: "obj",
      name: "coll",
      childs: [
        {
          type: "int",
          name: "id",
        },
        {
          type: "str",
          name: "name",
          validations: [{ name: "shouldbe", data: ["John", "BJP"] }],
        },
        { type: "int", name: "age" },
        {
          type: "obj",
          name: "address",
          childs: [
            { type: "str", name: "street" },
            { type: "str", name: "city" },
            { type: "str", name: "state" },
          ],
        },
      ],
    },
  ],
};

console.log(testArc.arcInit({ root: expected, data: received }));
