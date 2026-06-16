#!/usr/bin/env tsx

import {Contest} from "../Contest";
import {StatusEnum} from "../domain/models/TestStatus";
import type {IEventListener} from "../domain/services/events/IEventListener";
import {ArgsParser} from "../infra/services/ArgsParser";
import {DotReporter} from "../application/services/reporters/DotReporter";
import {TreeReporter} from "../application/services/reporters/TreeReporter";
import {DebugListener} from "../application/services/events/DebugListener";

type ContestRunOptions = {
    path?: string,
    reporter: IEventListener,
    verbose: boolean
}

const argsParser = new ArgsParser<ContestRunOptions>()
    .addFlag('verbose', {
        description: 'Debug mode'
    })
    .addOption('reporter', {
        description: 'Reporter to display the tests: dot or tree',
        getValue(arg: string): any {
            if (arg === 'dot') return new DotReporter();
            if (arg === 'tree') return new TreeReporter();
            throw new Error(`Unknown reporter: ${arg}`);
        },
        default: new DotReporter()
    })
    .addPositional('path', {});

const args = argsParser.parse(process.argv.slice(2));
Contest.instance.addTestReporter(args.reporter);
if (args.verbose) {
    Contest.instance.addTestReporter(new DebugListener());
}

Contest.instance.run(args.path)
    .then((status) => {
        switch(status.status) {
            case StatusEnum.ok:
                console.log('✅ Done')
                process.exit(0);
            case StatusEnum.fail:
                console.log('❌ Test failed');
                for (const error of status.errors) {
                    console.error(error);
                    console.log('------------------')
                }
                process.exit(1);
            case StatusEnum.notRun:
                console.log('❓Nothing has been ran')
        }
    })
    .catch(err => console.error(err));
