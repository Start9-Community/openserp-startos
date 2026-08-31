import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { apiUsername } from '../utils'

const { InputSpec, Value } = sdk

const randomPassword = { charset: 'a-z,A-Z,0-9', len: 32 }

const inputSpec = InputSpec.of({
  password: Value.text({
    name: i18n('Password'),
    description: i18n(
      'The password for signing in as "admin". Use the generate button for a strong random one, or type your own.',
    ),
    required: true,
    masked: true,
    default: randomPassword,
    generate: randomPassword,
  }),
})

export const setPassword = sdk.Action.withInput(
  'set-password',

  {
    name: i18n('Set API Password'),
    description: i18n(
      'Set or rotate the password protecting the API and MCP addresses. OpenSERP has no login of its own, so StartOS enforces this one at the edge.',
    ),
    warning: i18n('Every client using the old password stops working.'),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },

  inputSpec,

  async () => ({
    password: (await storeJson.read((s) => s?.apiPassword).once()) ?? undefined,
  }),

  async ({ effects, input }) => {
    await storeJson.merge(effects, { apiPassword: input.password })

    return {
      version: '1',
      title: i18n('API Password'),
      message: i18n(
        'Send these with every request to an OpenSERP address, as HTTP basic authentication.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: apiUsername,
            masked: false,
            copyable: true,
            qr: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: input.password,
            masked: true,
            copyable: true,
            qr: false,
          },
        ],
      },
    }
  },
)
