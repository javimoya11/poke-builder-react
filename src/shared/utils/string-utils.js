/**
 * Formatea el nombre de un Pokémon
 * @param {string} name 
 * @returns string
 */
export const prettify = (name) => {
    let formattedName = name.replace(/-/g, " ");
    const parts = formattedName.split(' ');
    if (formattedName.includes('mega')) {
        const index = parts.indexOf("mega");

        if (index !== -1) {
            parts.unshift(...parts.splice(index, 1));
        }
    }
    if (formattedName.includes('primal')) {
        const index = parts.indexOf("primal");

        if (index !== -1) {
            parts.unshift(...parts.splice(index, 1));
        }
    }
    if (formattedName.includes('alola')) {
        const index = parts.indexOf("alola");

        if (index !== -1) {
            parts.unshift(...parts.splice(index, 1));
        }

        parts[0] = 'alolan'
    }
    if (formattedName.includes('galar')) {
        const index = parts.indexOf("galar");

        if (index !== -1) {
            parts.unshift(...parts.splice(index, 1));
        }

        parts[0] = 'galarian'
    }
    if (formattedName.includes('hisui')) {
        const index = parts.indexOf("hisui");

        if (index !== -1) {
            parts.unshift(...parts.splice(index, 1));
        }

        parts[0] = 'hisuian'
    }
    if (formattedName.includes('gmax')) {
        const index = parts.indexOf("gmax");

        parts[index] = 'g-Max'
    }
    if (formattedName.includes('striped')) {
        const index = parts.indexOf("striped");
        if (index !== -1) {
            parts.splice(index, 1);
        }
    }
    if (formattedName.includes('standard')) {
        const index = parts.indexOf("standard");
        if (index !== -1) {
            parts.splice(index, 1);
        }
    }
    if (formattedName.includes('average')) {
        const index = parts.indexOf("average");
        if (index !== -1) {
            parts.splice(index, 1);
        }
    }
    formattedName = parts.join(" ");
    return formattedName;
};