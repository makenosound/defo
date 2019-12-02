import observe from "./observe";
export default function defo({ prefix = "defo", scope = document.documentElement, views = {} } = {}) {
    const observer = observe({ prefix, scope, views });
    return {
        destroy: () => {
            observer.disconnect();
        }
    };
}
