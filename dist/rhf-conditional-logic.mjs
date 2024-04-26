import { useWatch, useForm } from "react-hook-form";
const objectKeys = Object.keys;
const integerRegex = /^\d+$/;
const integerIndexRegex = /(\.\d+(\.|$))/;
const hashIndexRegex = /\.#(\.|$)/;
function getConditionKeyWithHashThatMatchesPath(pathWithIndices, conditionKeysWithHashes) {
  const pathParts = pathWithIndices.split(".");
  for (const conditionKey of conditionKeysWithHashes) {
    const conditionKeyParts = conditionKey.split(".");
    if (pathParts.length !== conditionKeyParts.length)
      continue;
    const conditionMatchesPath = pathParts.every((pathPart, pathPartIndex) => {
      const conditionKeyPart = conditionKeyParts[pathPartIndex];
      if (pathPart === conditionKeyPart)
        return true;
      return integerRegex.test(pathPart) && conditionKeyPart === "#";
    });
    if (conditionMatchesPath)
      return conditionKey;
  }
  return void 0;
}
function swapOutHashesInFieldPath(requestedFieldPath, conditionalFieldPath) {
  if (!hashIndexRegex.test(requestedFieldPath)) {
    return requestedFieldPath;
  }
  const conditionalFieldPathParts = conditionalFieldPath.split(".");
  let hasDiverged = false;
  return requestedFieldPath.split(".").map((requestedPart, requestedPartIndex) => {
    if (hasDiverged)
      return requestedPart;
    const conditionalPart = conditionalFieldPathParts[requestedPartIndex];
    if (!conditionalPart)
      return requestedPart;
    if (conditionalPart === requestedPart)
      return requestedPart;
    if (requestedPart === "#" && integerRegex.test(conditionalPart)) {
      return conditionalPart;
    }
    hasDiverged = true;
    return requestedPart;
  }).join(".");
}
function getConditionalLogicWithDependencies(formFieldPaths, conditions, getValues) {
  const dependencies = /* @__PURE__ */ new Set();
  function getDependencyValue(fieldOrFields) {
    if (!fieldOrFields) {
      throw new Error("Please pass getValues a field name or array of field names");
    }
    if (Array.isArray(fieldOrFields)) {
      for (const field of fieldOrFields) {
        dependencies.add(field);
      }
    } else {
      dependencies.add(fieldOrFields);
    }
    return getValues(fieldOrFields);
  }
  const formFieldVisibility = getConditionalLogic(
    formFieldPaths,
    conditions,
    getDependencyValue
  );
  return { formFieldVisibility, dependencies };
}
function getConditionalLogic(formFieldPaths, conditions, getValues) {
  const conditionKeysWithHashes = objectKeys(conditions).filter(
    (key) => hashIndexRegex.test(key)
  );
  return formFieldPaths.map((path) => {
    let isVisible = true;
    if (path in conditions) {
      isVisible = conditions[path](getValues);
    } else if (conditionKeysWithHashes.length && integerIndexRegex.test(path)) {
      const conditionKey = getConditionKeyWithHashThatMatchesPath(
        path,
        conditionKeysWithHashes
      );
      if (conditionKey) {
        const modifiedGetValues = (fieldOrFields) => {
          const transformedFieldOrFields = Array.isArray(fieldOrFields) ? fieldOrFields.map((field) => swapOutHashesInFieldPath(field, path)) : swapOutHashesInFieldPath(fieldOrFields, path);
          return getValues(transformedFieldOrFields);
        };
        isVisible = conditions[conditionKey](modifiedGetValues);
      }
    }
    return isVisible;
  });
}
function deleteByPathWithoutMutation(object, path) {
  const keysToRecurse = path.split(".");
  const lastKey = keysToRecurse.pop();
  if (!lastKey)
    return object;
  if (!keysToRecurse.length) {
    const clone = { ...object };
    delete clone[lastKey];
    return clone;
  }
  let objectToDeleteFrom = object;
  for (const key of keysToRecurse) {
    objectToDeleteFrom = objectToDeleteFrom[key];
    if (!objectToDeleteFrom || typeof objectToDeleteFrom !== "object") {
      return object;
    }
  }
  const objectWithDeletedKey = { ...objectToDeleteFrom };
  delete objectWithDeletedKey[lastKey];
  const newParentObject = { ...object };
  let objectToUpdate = newParentObject;
  keysToRecurse.forEach((key, index) => {
    if (index < keysToRecurse.length - 1) {
      objectToUpdate[key] = Array.isArray(objectToUpdate[key]) ? (
        // @ts-expect-error Clone array
        [...objectToUpdate[key]]
      ) : (
        // @ts-expect-error Clone object
        { ...objectToUpdate[key] }
      );
      objectToUpdate = objectToUpdate[key];
    } else {
      objectToUpdate[key] = objectWithDeletedKey;
    }
  });
  return newParentObject;
}
function getByPath(object) {
  return function(path) {
    const keys = path.split(".");
    let value = object;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return void 0;
      }
    }
    return value;
  };
}
function useCondition(fieldNamePaths, conditions, getValues, control) {
  const { formFieldVisibility, dependencies } = getConditionalLogicWithDependencies(
    fieldNamePaths,
    conditions,
    getValues
  );
  useWatch({ control, name: Array.from(dependencies) });
  return formFieldVisibility;
}
function pruneHiddenFields(getValues, conditions) {
  const fieldPathsWithHashes = objectKeys(
    conditions
  );
  let values = getValues();
  const fieldPaths = fieldPathsWithHashes.map((fieldPath) => {
    const pathParts = fieldPath.split(".");
    if (!pathParts.includes("#"))
      return fieldPath;
    const hashIndices = pathParts.map((part, index) => part === "#" ? index : false).filter((i) => i !== false);
    let pathsToTransform = [fieldPath];
    for (const hashIndex of hashIndices) {
      if (!pathsToTransform.length)
        break;
      const nextPathsToTransform = [];
      for (const path of pathsToTransform) {
        const partsBeforeHash = path.split(".").slice(0, hashIndex);
        const partsAfterHash = path.split(".").slice(hashIndex + 1);
        const expectedArray = getByPath(values)(partsBeforeHash.join("."));
        if (Array.isArray(expectedArray)) {
          expectedArray.forEach((_, index) => {
            nextPathsToTransform.push(
              [...partsBeforeHash, index, ...partsAfterHash].join(".")
            );
          });
        }
      }
      pathsToTransform = nextPathsToTransform;
    }
    return pathsToTransform;
  }).flat();
  const conditionResults = getConditionalLogic(fieldPaths, conditions, getValues);
  fieldPaths.forEach((fieldPath, index) => {
    const isHidden = conditionResults[index] === false;
    if (isHidden) {
      values = deleteByPathWithoutMutation(values, fieldPath);
    }
  });
  return values;
}
function useConditionalForm(props) {
  const { conditions, resolver, ...useFormOptions } = props;
  const formMethods = useForm({
    resolver: (_, ...otherArgs) => {
      const prunedValues = pruneHiddenFields(formMethods.getValues, conditions);
      return resolver(prunedValues, ...otherArgs);
    },
    ...useFormOptions
  });
  return formMethods;
}
export {
  getConditionalLogic,
  getConditionalLogicWithDependencies,
  pruneHiddenFields,
  useCondition,
  useConditionalForm
};
