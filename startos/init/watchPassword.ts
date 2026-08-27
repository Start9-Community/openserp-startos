import { setPassword } from '../actions/setPassword'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchPassword = sdk.setupOnInit(async (effects) => {
  const password = await storeJson.read((s) => s?.apiPassword).const(effects)

  if (!password) {
    await sdk.action.createOwnTask(effects, setPassword, 'critical', {
      reason: i18n(
        'OpenSERP has no login of its own. Set a password before starting it, or anyone who can reach its address can search and fetch pages through your server.',
      ),
    })
  }
})
