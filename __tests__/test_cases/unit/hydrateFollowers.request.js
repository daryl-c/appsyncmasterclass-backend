const chance = require('chance').Chance();
const path = require('path');
const given = require('../../steps/given');
const when = require('../../steps/when');

describe('hydrateFollowers.request template', () => {
    it('Should return empty array if prev.result.relationships. is empty', () => {
        const templatePath = path.resolve(__dirname, '..', '..', '..', 'mapping-templates', 'hydrateFollowers.request.vtl');

        const username = chance.guid();
        const prev = {
            result: {
                relationships: []
            }
        };
        const context = given.an_appsync_context({ username }, {}, {}, {}, {}, prev);

        const { profiles } = when.we_invoke_an_appsync_template(templatePath, context);
        expect(profiles).toEqual([]);
    });

    it('Should convert timeline tweets to BatchGetItem keys', () => {
        const templatePath = path.resolve(__dirname, '..', '..', '..', 'mapping-templates', 'hydrateFollowers.request.vtl');


        const username = chance.guid();
        const otherUserId = chance.guid();
        const userId = chance.guid();
        const relationships = [{ userId, otherUserId, sk: `FOLLOWS_${otherUserId}` }];
        const prev = {
            result: {
                relationships
            }
        };
        const context = given.an_appsync_context({ username }, {}, {}, {}, {}, prev);

        const result = when.we_invoke_an_appsync_template(templatePath, context);
        expect(result).toEqual({
            "version": "2018-05-29",
            "operation": "BatchGetItem",
            "tables": {
                "${UsersTable}": {
                    "keys": [{
                        "id": {
                            "S": userId
                        }
                    }],
                    "consistentRead": false
                }
            }
        });
    });
});