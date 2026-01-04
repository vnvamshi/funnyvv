function analyze(text) {
    const lower = text.toLowerCase();
    const pos = ['thank','great','awesome','love','amazing','perfect','good'];
    const neg = ['hate','terrible','awful','bad','frustrated','angry'];
    const agg = ['hell','damn','wtf','stupid','idiot','crap'];
    
    let sentiment='neutral', emotion='calm', empathy=0.5, aggression=0, politeness=0.5;
    
    if (agg.some(w=>lower.includes(w))) { sentiment='aggressive'; emotion='anger'; aggression=0.8; empathy=0.2; }
    else if (neg.some(w=>lower.includes(w))) { sentiment='negative'; emotion='frustration'; empathy=0.3; }
    else if (pos.some(w=>lower.includes(w))) { sentiment='positive'; emotion='happy'; empathy=0.8; }
    
    if (lower.includes('please')||lower.includes('thank')) politeness=0.9;
    if (lower.includes('thank')) emotion='gratitude';
    else if (lower.includes('help')) emotion='seeking_help';
    else if (lower.match(/^(hello|hi|hey)/)) emotion='greeting';
    else if (lower.includes('bye')) emotion='farewell';
    
    let intent='conversation';
    if (lower.match(/^(open|go to|show|navigate)/)) intent='navigation';
    else if (lower.match(/^(what|how|why|tell)/)) intent='query';
    else if (lower.match(/^(stop|pause)/)) intent='system_stop';
    else if (lower.match(/^(go back|back)/)) intent='system_back';
    else if (lower.match(/^(close|exit|home)/)) intent='system_close';
    else if (lower.includes('fix')||lower.includes('debug')) intent='dev_command';
    
    let tone = lower.endsWith('!')?'emphatic':lower.endsWith('?')?'questioning':'neutral';
    
    return { sentiment, emotion, empathyScore:empathy, aggressionLevel:aggression, politenessScore:politeness, intent, tone };
}
module.exports = { analyze };
