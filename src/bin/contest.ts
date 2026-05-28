import {Contest} from "../Contest";

Contest.instance.run()
    .then(() => console.log('✅ Done'))
    .catch(err => console.error(err));
