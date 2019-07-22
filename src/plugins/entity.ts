import { Agent } from '../';
import { VERSION } from '../Constants';
import * as hashes from '../lib/crypto';
import {
    NS_DELAY,
    NS_EME_0,
    NS_FORWARD_0,
    NS_HASH_NAME,
    NS_HASHES_1,
    NS_HASHES_2,
    NS_IDLE_1,
    NS_JSON_0,
    NS_OOB,
    NS_PSA,
    NS_REFERENCE_0,
    NS_SHIM,
    NS_TIME,
    NS_VERSION
} from '../Namespaces';
import { EntityTime, IQ, ReceivedIQGet, SoftwareVersion } from '../protocol';

declare module '../' {
    export interface Agent {
        getSoftwareVersion(jid: string): Promise<SoftwareVersion>;
        getTime(jid: string): Promise<EntityTime>;
    }

    export interface AgentConfig {
        /**
         * Software Version Info
         *
         * @default { name: "stanzajs.org" }
         */
        softwareVersion?: SoftwareVersion;
    }

    export interface AgentEvents {
        'iq:get:softwareVersion': ReceivedIQGet & {
            softwareVersion: SoftwareVersion;
        };
        'iq:get:time': IQ & {
            time: EntityTime;
        };
    }
}

export default function(client: Agent) {
    client.disco.addFeature('jid\\20escaping');

    client.disco.addFeature(NS_DELAY);
    client.disco.addFeature(NS_EME_0);
    client.disco.addFeature(NS_FORWARD_0);
    client.disco.addFeature(NS_HASHES_2);
    client.disco.addFeature(NS_HASHES_1);
    client.disco.addFeature(NS_IDLE_1);
    client.disco.addFeature(NS_JSON_0);
    client.disco.addFeature(NS_OOB);
    client.disco.addFeature(NS_PSA);
    client.disco.addFeature(NS_REFERENCE_0);
    client.disco.addFeature(NS_SHIM);

    const names = hashes.getHashes();
    for (const name of names) {
        client.disco.addFeature(NS_HASH_NAME(name));
    }

    client.disco.addFeature(NS_TIME);
    client.disco.addFeature(NS_VERSION);

    client.on('iq:get:softwareVersion', iq => {
        return client.sendIQResult(iq, {
            softwareVersion: client.config.softwareVersion || {
                name: 'stanzajs.org',
                version: VERSION
            }
        });
    });

    client.on('iq:get:time', (iq: IQ) => {
        const time = new Date();
        client.sendIQResult(iq, {
            time: {
                tzo: time.getTimezoneOffset(),
                utc: time
            }
        });
    });

    client.getSoftwareVersion = async (jid: string) => {
        const resp = await client.sendIQ({
            softwareVersion: {},
            to: jid,
            type: 'get'
        });

        return resp.softwareVersion;
    };

    client.getTime = async (jid: string) => {
        const resp = await client.sendIQ({
            time: {},
            to: jid,
            type: 'get'
        });

        return resp.time;
    };
}
