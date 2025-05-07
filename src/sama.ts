function addSamaToNames(names: IteratorObject<string>){
    return names.map(e => {
        if(e.toLocaleLowerCase() === "google")
            throw new Error("生理的に無理です");
        return `${e}様`; // 豪華にテンプレートリテラルを使う
    })
}

const names = new Set<string>();
names.add("Microsoft");
names.add("Microsoft");
names.add("Microsoft");
names.add("Qiita");
names.add("Microsoft");
names.add("GitHub");
names.add("Yahoo");
names.add("Google");

try{
    var samas = addSamaToNames(names.values());
}catch{
    // addSamaToNamesでのエラーはここで受け止めたい
    throw new Error("ブロックされました。");
}

console.log(samas.toArray().join("、"));
