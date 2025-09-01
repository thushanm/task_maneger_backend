
const allowedTransitions = {
    todo: ['in_progress'],
    in_progress: ['todo', 'done'],
    done: [],
};


function canTransition(from, to) {
    if (from === to) return true;
    return allowedTransitions[from]?.includes(to) || false;
}

module.exports = { canTransition };
