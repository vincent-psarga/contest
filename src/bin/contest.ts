import {Contest} from "../Contest";
import {StatusEnum} from "../domain/models/TestStatus";


const path = process.argv[2];

Contest.instance.run(path)
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
