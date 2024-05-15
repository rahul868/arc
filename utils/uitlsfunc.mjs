/*
    EACH NODE IN SCHEMA have some value associated with it.
    
    We are going to implement feature for checking exact value of specific
    property if it exist.
    Ex . {data:{type:"test"}}
    So if I need to check that name proeprty have test value received data , 
    this functionality will be useful..

    This strict value checking funcationality is only applicable to below TYPES:
    - Strings
    - Number
    - Boolean

    Thier is no sense for object strict value checking.


*/

import { arc } from "../arc.mjs";

function collectionSchema(nodeData, schemaProps) {
  /*
    Basic validation for type checking and input parameter checking.
    nodeData : It should be array , and It should have 1 st index to run this validator.
    schemaData : Expected schema to validate against received Data. Also it receives more parameters 
    such as start and end point of arr index.

    const {start=0, end=1 , schema} = schemaProps;

  */

  if (!nodeData.length > 0) {
    // We have not received expected array
    return {
      success: false,
      msg: `collectionSchema checking is declined because Provided array is not valid.`,
    };
  }

  if (
    !schemaProps ||
    typeof schemaProps != "object" ||
    Array.isArray(schemaProps)
  ) {
    // We have not received expected array
    return {
      success: false,
      msg: `collectionSchema checking is declined because expected schema is not available.`,
    };
  }

  const { start = 0, end = 1, schema } = schemaProps;

  if (!schema || typeof schema != "object" || Array.isArray(schema)) {
    return {
      success: false,
      msg: `collectionSchema checking is declined because Valid schema received.`,
    };
  }

  const validatorRec = arc();
  for (let i = 0; i < nodeData.length; i++) {
    let arrRecStatus = validatorRec.arcInit({
      root: schema,
      data: nodeData[i],
    });

    if (!arrRecStatus.success) {
      return arrRecStatus;
    }
    console.log(i, "->", arrRecStatus);
  }
  return {
    success: true,
    msg: `Validates!`,
  };
}

function shouldBe(nodeData, valueArr) {
  if (!valueArr || !Array.isArray(valueArr)) {
    return {
      success: false,
      msg: `Value checking is declined because valueArray is not provided.`,
    };
  }
  for (let k = 0; k < valueArr.length; k++) {
    if (nodeData == valueArr[k]) {
      return {
        success: true,
        msg: `Value matched`,
      };
    }
  }

  return {
    success: false,
    msg: `${nodeData} value is not matching with rececived and allowed values.`,
  };
}

function gt(cmpThis, cmpWith) {
  /* 
    Greater than check type for integers and array types. It 
    just validate is the received value is greater than expected count.
    count > 
  */

  if (Array.isArray(cmpThis)) {
    cmpThis = cmpThis.length;
  }

  console.log("count", cmpThis, cmpWith);
  if (typeof cmpWith != "number") {
    return {
      success: false,
      msg: `Greater validation checking is declined because count is not number.`,
    };
  }

  if (cmpThis > cmpWith) {
    return {
      success: true,
      msg: `Value matched`,
    };
  }

  return {
    success: false,
    msg: `${cmpThis} is not greater than expected count.`,
  };
}

function lt(cmpThis, cmpWith) {
  /* 
    Greater than check type for integers and array types. It 
    just validate is the received value is greater than expected count.
    count > 
  */

  if (Array.isArray(cmpThis)) {
    cmpThis = cmpThis.length;
  }

  if (typeof cmpWith != "number") {
    return {
      success: false,
      msg: `Greater validation checking is declined because count is not number.`,
    };
  }

  if (cmpThis < cmpWith) {
    return {
      success: true,
      msg: `Value matched`,
    };
  }

  return {
    success: false,
    msg: `${cmpThis} is not less than expected count.`,
  };
}

function equal(cmpThis, cmpWith) {
  /* 
    Greater than check type for integers and array types. It 
    just validate is the received value is greater than expected count.
    count > 
  */

  if (Array.isArray(cmpThis)) {
    cmpThis = cmpThis.length;
  }

  if (typeof cmpWith != "number") {
    return {
      success: false,
      msg: `Greater validation checking is declined because count is not number.`,
    };
  }

  if (cmpThis == cmpWith) {
    return {
      success: true,
      msg: `Value matched`,
    };
  }

  return {
    success: false,
    msg: `${cmpThis} is not equal to expected count.`,
  };
}
const permitValidations = {
  shouldbe: { allowed: true, callback: shouldBe },
  gtthan: { allowed: true, callback: gt },
  ltthan: { allowed: true, callback: lt },
  equalto: { allowed: true, callback: equal },
  colschema: { allowed: true, callback: collectionSchema },
};
export { permitValidations };
