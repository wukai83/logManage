export class CommonUtils {

    /**
     * 是否为空
     * @param value 值
     */
    static isEmpty(value: any): boolean {
        return value === null || value === undefined || typeof value === 'string' && value.length === 0;
    }

    /**
     * 是否不为空
     * @param value 值
     */
    static isNotEmpty(value: any): boolean {
        return !CommonUtils.isEmpty(value);
    }

    /**
     * 是否数组
     * @param vaue 值
     */
    static isArray(value: any): boolean {
        return Array.isArray(value);
    }

    /**
     * 是否对象
     * @param vaue 值
     */
    static isObject(value: any): boolean {
        return typeof value === 'object' && !CommonUtils.isArray(value);
    }

    /**
    * クラスをJSONに変換する。
    * @param map マップ
    */
    static toJson(obj: any): any {
        const json: any = {};
        if (obj !== null && obj !== undefined) {
            Object.keys(obj).forEach(key => {
                const val = obj[key];
                if (val !== null && val !== undefined) {
                    if (this.isObject(val)) {
                        this.toJson(val);
                    } else {
                        json[key] = val;
                    }
                }
            });
        }

        return json;
    }

    static padLeft(val: string, fill: number, fix = ' '): string {
        const len = val.length;
        return (Array(
            fill > len ? fill - len + 1 || 0 : 0
        ).join(fix) + val);
    }

    static padRight(val: string, fill: number, fix = ' '): string {
        const len = val.length;
        return (val + Array(
            fill > len ? fill - len + 1 || 0 : 0
        ).join(fix));
    }
}
