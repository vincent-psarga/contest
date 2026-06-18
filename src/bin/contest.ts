#!/usr/bin/env tsx

import {Contest} from "../Contest";
import {StatusEnum} from "../domain/models/TestStatus";
import type {IEventListener} from "../domain/services/events/IEventListener";
import {ArgsParser} from "../infra/services/ArgsParser";
import {DotReporter} from "../application/services/reporters/DotReporter";
import {TreeReporter} from "../application/services/reporters/TreeReporter";
import {DebugListener} from "../application/services/events/DebugListener";
import {ConsoleLogger} from "../infra/services/ConsoleLogger";

type ContestRunOptions = {
    path?: string,
    reporter: IEventListener,
    verbose: boolean,
    timeout: number,
}
const consoleLogger = new ConsoleLogger(process.stdout.isTTY);

const argsParser = new ArgsParser<ContestRunOptions>()
    .addFlag('verbose', {
        description: 'Debug mode'
    })
    .addOption('reporter', {
        description: 'Reporter to display the tests: dot or tree',
        getValue(arg: string): any {
            if (arg === 'dot') return new DotReporter(consoleLogger);
            if (arg === 'tree') return new TreeReporter(consoleLogger);
            throw new Error(`Unknown reporter: ${arg}`);
        },
        default: new DotReporter(consoleLogger)
    })
    .addOption('timeout', {
        description: 'Default timeout after which a test is considered as failed',
        default: 1000,
        getValue: parseInt
    })
    .addPositional('path', {});

const args = argsParser.parse(process.argv.slice(2));

Contest.initInstance({timeout: args.timeout});

Contest.instance.addTestReporter(args.reporter);
if (args.verbose) {
    Contest.instance.addTestReporter(new DebugListener(consoleLogger));
}

Contest.instance.run(args.path)
    .then((status) => {
        switch(status.status) {
            case StatusEnum.ok:
                consoleLogger.log('✅ Done')
                process.exit(0);
            case StatusEnum.fail:
                consoleLogger.error('❌ Test failed');
                for (const error of status.errors) {
                    consoleLogger.error(error);
                    consoleLogger.log('------------------')
                }
                process.exit(1);
            case StatusEnum.notRun:
                consoleLogger.log('❓Nothing has been ran')
        }
    })
    .catch(err => consoleLogger.error(err));
