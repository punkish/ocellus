import { terser } from "rollup-plugin-terser";

export default [
    {
        input: 'dev/js/ocellus.js',
        output: {
            file: 'js/ocellus.js',
            format: "esm",
            plugins: [terser()],
        }
    }
]