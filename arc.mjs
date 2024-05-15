/*
  This function validates the response or any received object data from network resources or APIs in a recursive manner for better error handling.

  Schema structure:
  The schema is defined using an object that contains the root node of the expected structure.
  Each node in the schema must contain the following properties:
    - type: Expected data type of the property.
    - name: Name of the property.
    - childs: An optional array of child nodes.

  Utility functions:
  - rtnError: Returns an error object with a custom message.
  - rtnSuccess: Returns a success object indicating that the response is as expected.

  Functions:
  - validateChilds: Validates the child nodes of an object recursively.
  - validateIndividualNode: Validates an individual node against the schema.
  - validateCommand: Validates the overall structure of the received object against the expected schema.

  @param {Object} expectedSchema - The expected schema of the object data.
  @param {Object} currentObject - The object data to be validated against the schema.
  @returns {Object} - Returns a success object if the validation is successful, otherwise returns an error object.

*/
import { permitValidations } from "./utils/uitlsfunc.mjs";
// Global config object which keep track of arc instance settings
const arcConfig = {
  adValidation: false,
  size: 1000,
};

function rtnError(msg) {
  return { success: false, msg };
}

function rtnSuccess() {
  return { success: true, msg: "Structure is as expected. All tests passed." };
}

/*
    Permit types are set of data types which are allowed in arc.
*/

const permitChilds = {
  obj: { nativeType: "object", allowedProps: { childs: true } },
  arr: {
    nativeType: "array",
    validations: {
      gtthan: permitValidations["gtthan"],
      ltthan: permitValidations["ltthan"],
      equalto: permitValidations["equalto"],
      colschema: permitValidations["colschema"],
    },
    allowedProps: { childs: false },
  },
  int: {
    nativeType: "number",
    validations: {
      gtthan: permitValidations["gtthan"],
      shouldbe: permitValidations["shouldbe"],
      ltthan: permitValidations["ltthan"],
      equalto: permitValidations["equalto"],
    },
    allowedProps: { childs: false },
  },
  bool: {
    nativeType: "boolean",
    validations: {
      shouldbe: permitValidations["shouldbe"],
    },
    allowedProps: {},
  },
  str: {
    nativeType: "string",
    validations: {
      shouldbe: permitValidations["shouldbe"],
    },
  },
};

function checkTypes(type, node) {
  // Ex
  // type : "string"
  // node : "Rahul"
  if (!permitChilds[type]) {
    return {
      success: false,
      msg: `${type} Type not allowed. Please pass valid type.`,
    };
  }

  if (permitChilds[type]["nativeType"] == "array" && Array.isArray(node)) {
    return {
      success: true,
      msg: "Type validated!",
      typeAllowedProps: permitChilds[type]["allowedProps"],
    };
  }

  if (permitChilds[type]["nativeType"] == typeof node) {
    // Type is validated.
    return {
      success: true,
      msg: "Type validated!",
      typeAllowedProps: permitChilds[type]["allowedProps"],
    };
  }

  // Default false rtn for invalid type.
  return {
    success: false,
    msg: `Type not matched. Expected ${type} but got ${typeof node}.`,
  };
}

function initValidation(type, node, vldArr) {
  /*
    node : Actual node or data which we have received from Third-party resource. (API)
    vldArr : It is an array of validations which user want to perform on 
    respective node of schema.
    [{name:"name of validation",data:[]}]

  */
  let currType = permitChilds[type];

  // Check for is respective type have allowed validations.
  if (!currType["validations"] || typeof currType["validations"] !== "object") {
    return rtnError(`No validations allowed for ${type}`);
  }

  for (let i = 0; i < vldArr.length; i++) {
    const validationFunction = currType["validations"][vldArr[i]["name"]];
    if (
      !validationFunction ||
      typeof validationFunction["callback"] !== "function"
    ) {
      return rtnError(
        `${vldArr[i]["name"]} validation filter not allowed for ${type}`
      );
    }
    let vldStatus = validationFunction["callback"](node, vldArr[i]["data"]);
    if (!vldStatus.success) {
      return rtnError(vldStatus.msg);
    }
  }
  return { success: true };
}

function objNestingTest(root) {
  let { type, name, childs } = root;
  if (childs && !type && !name) {
    return true;
  }
  return false;
}

function validateChilds(childArr, currObj) {
  // Recursive function to validate child nodes
  for (let c = 0; c < childArr.length; c++) {
    let status = validateIndividualNode(childArr[c], currObj);
    if (!status.success) {
      return status;
    }
  }
  return rtnSuccess();
}

function validateIndividualNode(nodeObj, currObj) {
  const startTime = performance.now();

  let { type, name, childs, arrSchema, validations } = nodeObj;
  if (!type || !name) {
    return rtnError("Type and name properties are required in the root node.");
  }

  if (currObj[name] === undefined) {
    return rtnError(`${name} property does not exist.`);
  }

  let typeStatus = checkTypes(type, currObj[name]);
  if (!typeStatus.success) {
    return rtnError(typeStatus.msg);
  }

  /*
    Since type is validated we can process for validation step
    We have already get signal for validation allowed or not from above
    checkTypes call. (property name : isValidationAllowed)
  */
  if (validations) {
    if (Array.isArray(validations)) {
      if (validations.length > 0) {
        let vldStatus = initValidation(type, currObj[name], validations);
        if (!vldStatus.success) {
          return rtnError(vldStatus.msg);
        }
      }
    } else {
      return rtnError(`Validations for ${name} should be an array of objects.`);
    }
  }

  if (childs) {
    // Check for validating is childs allowed for this respective TYPE
    if (
      !typeStatus["typeAllowedProps"] ||
      !typeStatus["typeAllowedProps"]["childs"]
    ) {
      return rtnError(`Childs props is not permited for ${type} type.`);
    }

    // Executed when child exist and also respective type has permission to accept childs prop.
    if (Array.isArray(childs)) {
      if (childs.length > 0) {
        return validateChilds(childs, currObj[name]);
      }
    } else {
      return rtnError(
        `Property ${name} has invalid child type. Childs should be an array of objects.`
      );
    }
  }

  return rtnSuccess();
}

function validateCommand(scrut) {
  let { root, data } = scrut;
  if (!root || !data) {
    return rtnError("Invalid structure. root and data object is required.");
  }

  if (typeof root != "object" || typeof data != "object") {
    return rtnError("Invalid structure. root and data must be object.");
  }

  // Check is multiple properties are exist in root level.
  let isMltrt = objNestingTest(root);
  if (isMltrt) {
    let modRoot = { name: "data", type: "obj", childs: root.childs };
    let modData = { data: data };
    return validateIndividualNode(modRoot, modData);
  }
  return validateIndividualNode(root, data);
}

function arc(config) {
  // arcConfig = { ...arcConfig, ...config };
  // console.log(arcConfig);
  // Encapsulation of private functions and properties , to outside world.
  // Will only return function which are allowed to access for outside modules.
  return {
    arcInit: validateCommand,
    arcTypes: permitChilds,
  };
}

export { arc };
