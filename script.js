document.addEventListener('DOMContentLoaded', () => {
    let players = [];
    let currentGame = [];
    let gameHistory = JSON.parse(localStorage.getItem('gameHistory')) || [];

    const playerList = document.getElementById('playerList');
    const scoreBoard = document.getElementById('scoreBoard');
    const historyList = document.getElementById('historyList');
    const addPlayerButton = document.querySelector('.add-player');
    const newRoundButton = document.querySelector('.new-round');
    const finishGameButton = document.querySelector('.finish-game');
    const totalScoreDisplay = document.createElement('div');
    totalScoreDisplay.className = 'total-score-display';
    scoreBoard.parentNode.insertBefore(totalScoreDisplay, scoreBoard.nextSibling);

    // 绑定事件监听器
    addPlayerButton.addEventListener('click', addPlayer);
    newRoundButton.addEventListener('click', startNewRound);
    finishGameButton.addEventListener('click', finishGame);

    // 添加清除历史记录按钮
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.className = 'clear-history';
    clearHistoryButton.textContent = '清除历史记录';
    historyList.parentNode.insertBefore(clearHistoryButton, historyList);
    clearHistoryButton.addEventListener('click', clearHistory);

    // 添加玩家
    function addPlayer() {
        const input = document.querySelector('.player-name');
        const name = input.value.trim();
        
        if (!name) {
            alert('请输入玩家名称');
            return;
        }
        
        if (players.includes(name)) {
            alert('该玩家已存在');
            return;
        }
        
        players.push(name);
        input.value = '';
        
        // 更新玩家列表显示
        const playerItem = document.createElement('div');
        playerItem.className = 'player-item';
        
        const playerName = document.createElement('span');
        playerName.textContent = name;
        playerItem.appendChild(playerName);

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-player';
        deleteButton.innerHTML = '删除';
        deleteButton.onclick = () => {
            const index = players.indexOf(name);
            if (index > -1) {
                players.splice(index, 1);
                playerItem.classList.add('removing');
                setTimeout(() => {
                    playerList.removeChild(playerItem);
                    updateScoreBoard();
                }, 300);
            }
        };
        playerItem.appendChild(deleteButton);

        const playerInput = playerList.querySelector('.player-input');
        playerList.insertBefore(playerItem, playerInput);
        
        updateScoreBoard();
    }

    // 更新计分板
    function updateScoreBoard() {
        scoreBoard.innerHTML = '';
        players.forEach(player => {
            const playerScore = document.createElement('div');
            playerScore.className = 'player-score';
            playerScore.innerHTML = `
                <span class="player-name">${player}</span>
                <div class="score-controls">
                    <input type="number" class="score-input" placeholder="分数" min="0">
                </div>
            `;
            scoreBoard.appendChild(playerScore);

            // 添加输入事件监听器
            const scoreInput = playerScore.querySelector('.score-input');
            scoreInput.addEventListener('input', function() {
                this.classList.remove('changed');
                void this.offsetWidth; // 触发重排以重置动画
                this.classList.add('changed');
            });
        });
    }

    // 新一轮
    function startNewRound() {
        const scores = {};
        let isValid = true;

        scoreBoard.querySelectorAll('.player-score').forEach(playerScore => {
            const name = playerScore.querySelector('.player-name').textContent;
            const score = parseInt(playerScore.querySelector('.score-input').value);

            if (isNaN(score)) {
                isValid = false;
                return;
            }
            scores[name] = score;
        });

        if (!isValid) {
            alert('请为所有玩家输入有效分数');
            return;
        }

        currentGame.push(scores);
        
        // 计算并显示当前总分
        const currentTotals = calculateTotalScores();
        updateTotalScoreDisplay(currentTotals);
        
        updateHistory();
        clearScores();
    }

    // 清空分数输入
    function clearScores() {
        scoreBoard.querySelectorAll('.score-input').forEach(input => {
            input.value = '';
        });
    }

    // 结束游戏
    function finishGame() {
        if (currentGame.length > 0) {
            const totalScores = calculateTotalScores();
            const gameData = {
                rounds: currentGame,
                totals: totalScores,
                timestamp: new Date().toLocaleString()
            };
            gameHistory.push(gameData);
            localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
            currentGame = [];
            updateHistory();
        }
    }

    // 计算总分
    function calculateTotalScores() {
        const totals = {};
        players.forEach(player => {
            totals[player] = currentGame.reduce((sum, round) => sum + (round[player] || 0), 0);
        });
        return totals;
    }

    // 更新总分显示
    function updateTotalScoreDisplay(totals) {
        totalScoreDisplay.innerHTML = '<h3>当前总分</h3>';
        Object.entries(totals).forEach(([player, score]) => {
            totalScoreDisplay.innerHTML += `<div class="player-total"><span>${player}</span><span>${score}分</span></div>`;
        });
    }

    // 清除历史记录
    function clearHistory() {
        if (confirm('确定要清除所有历史记录吗？')) {
            gameHistory = [];
            localStorage.removeItem('gameHistory');
            updateHistory();
        }
    }

    // 更新历史记录
    function updateHistory() {
        historyList.innerHTML = '';
        gameHistory.forEach((game, index) => {
            const gameElement = document.createElement('div');
            gameElement.className = 'history-item';
            
            let gameContent = `<h3>游戏 ${index + 1} - ${game.timestamp}</h3>`;
            gameContent += '<div class="game-totals">最终得分：';
            for (const [player, score] of Object.entries(game.totals)) {
                gameContent += `<br>${player}: ${score}分`;
            }
            gameContent += '</div>';
            
            gameElement.innerHTML = gameContent;
            historyList.insertBefore(gameElement, historyList.firstChild);
        });
    }

    // 支持回车添加玩家
    document.querySelector('.player-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addPlayer();
        }
    });
});