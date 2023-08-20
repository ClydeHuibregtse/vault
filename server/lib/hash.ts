export function hash(s: string): number {
    var hash = 5381;
    if (s.length == 0) return hash;
    for (let x = 0; x < s.length; x++) {
        let ch = s.charCodeAt(x);
        hash = (hash * 33) ^ ch;
    }
    return (hash >>> 0) & 0x7fffffff;
}
