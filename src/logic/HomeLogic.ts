export const abc = {
    rules: {
        a: {
            type: 'object',
            required: true,
            children: {
                phone: {
                    type: 'string',
                    required: true,
                    trim: true,
                    regPex: /^1\d{10}$/
                }
            }
        },
        b: {
            type: 'number',
            required: true,
            trim: true,
            max: 8
        },
        c: {
            type: 'array',
            required: true,
            children: {
                type: 'string',
                required: true,
                trim: true,
                length: 8
            }
        }
    },
    msg: {
        a: {
            phone: '手机号不正确'
        }
    }
}