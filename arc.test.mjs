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

// // Schema to validate (Received response from API or any object that need to check strictly
// let received = {
//   mark: {
//     coll: {
//       id: 1,
//       name: "BJPs",
//       age: false,
//       address: {
//         street: "123 Main St",
//         city: "Anytown",
//         state: "CA",
//         postalCode: "12345",
//       },
//     },
//   },
//   contacts: [
//     { type: "email", value: "john@example.com" },
//     { type: "phone", value: "555-123-4567" },
//   ],
// };

// // Expected schema to check in above data.
// let expected = {
//   type: "obj",
//   name: "mark",
//   childs: [
//     {
//       type: "obj",
//       name: "coll",
//       childs: [
//         {
//           type: "int",
//           name: "id",
//           // validations: [{ name: "greater", data: [0] }],
//         },
//         {
//           type: "str",
//           name: "name",
//         },
//         {
//           type: "bool",
//           name: "age",
//           validations: [{ name: "shouldbe", data: [false] }],
//         },
//         {
//           type: "obj",
//           name: "address",
//           childs: [
//             { type: "str", name: "street" },
//             { type: "str", name: "city" },
//             {
//               type: "str",
//               name: "state",
//               validations: [{ name: "shouldbe", data: ["John", "CA"] }],
//             },
//           ],
//         },
//       ],
//     },
//   ],
// };

// Schema to validate (Received response from API or any object that need to check strictly
let received = {
  mark: {
    coll: {
      id: 12,
      name: "BJPs",
      age: false,
      address: {
        street: "123 Main St",
        city: "-d",
        state: "CA",
        postalCode: "12345",
      },
    },
  },
  contacts: [
    { type: "email", value: "john@example.com" },
    { type: "phone", value: "555-123-4567" },
    { type: "phone", value: "555-123-4567" },
  ],
};

// Expected schema to check in above data.
let expected = {
  childs: [
    {
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
              validations: [
                { name: "ltthan", data: 22 },
                { name: "shouldbe", data: [12] },
              ],
            },
            {
              type: "str",
              name: "name",
            },
            {
              type: "bool",
              name: "age",
              validations: [{ name: "shouldbe", data: [false] }],
            },
            {
              type: "obj",
              name: "address",
              childs: [
                { type: "str", name: "street" },

                {
                  type: "str",
                  name: "city",
                  validations: [{ name: "shouldbe", data: ["-d"] }],
                },
                {
                  type: "str",
                  name: "state",
                  validations: [{ name: "shouldbe", data: ["Joh", "CA"] }],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: "arr",
      name: "contacts",
      validations: [{ name: "equalto", data: 3 }],
    },
  ],
};

const startTime = performance.now();
console.log(testArc.arcInit({ root: expected, data: received }));
console.log(performance.now() - startTime);
