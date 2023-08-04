import {
    CompiledTable,
    Dimension,
    Explore,
    UserAttribute,
} from '@lightdash/common';

export const hasUserAttribute = (
    userAttributes: UserAttribute[],
    attributeName: string,
    value: string,
) =>
    userAttributes.some(
        (ua) =>
            ua.name === attributeName &&
            ua.users.some((u) => u.value === value),
    );

export const hasUserAttributes = (
    requiredAttributes: Record<string, string> | undefined,
    userAttributes: UserAttribute[],
): boolean => {
    if (requiredAttributes === undefined) return true; // No required attributes

    // Check all required attributes conditions for dimension
    const hasAttributes = Object.entries(requiredAttributes).map(
        (attribute) => {
            const [attributeName, value] = attribute;
            return hasUserAttribute(userAttributes, attributeName, value);
        },
    );
    return hasAttributes.every((attribute) => attribute === true);
};

export const exploreHasFilteredAttribute = (explore: Explore) =>
    Object.values(explore.tables).some((table) =>
        Object.values(table.dimensions).some(
            (dimension) => dimension.requiredAttributes !== undefined,
        ),
    );
export const filterDimensionsFromExplore = (
    explore: Explore,
    userAttributes: UserAttribute[],
): Explore => ({
    ...explore,
    tables: Object.entries(explore.tables).reduce((at, exploreTable) => {
        const [tableName, table] = exploreTable;
        return {
            ...at,
            [tableName]: {
                ...table,
                dimensions: Object.entries(table.dimensions).reduce(
                    (acc, tableDimension) => {
                        const [dimensionName, dimension] = tableDimension;

                        if (
                            hasUserAttributes(
                                dimension.requiredAttributes,
                                userAttributes,
                            )
                        )
                            return { ...acc, [dimensionName]: dimension };
                        return acc;
                    },
                    [],
                ),
            },
        };
    }, {}),
});