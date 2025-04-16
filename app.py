from flask import Flask, render_template, jsonify, request 
from dotenv import load_dotenv
from openai import OpenAI
import os

app = Flask(__name__)

load_dotenv()

LLMFOUNDRY_TOKEN = os.getenv("LLMFOUNDRY_TOKEN")
BASE_URL = os.getenv("BASE_URL")

client = OpenAI(
    api_key=f"{LLMFOUNDRY_TOKEN}:minesweeper",
    base_url=BASE_URL,
) 

def get_completion_from_messages(prompt):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=1
    )
    return response.choices[0].message.content

mine_grid = [[' ' for _ in range(9)] for _ in range(9)]

def create_mine_grid():
    mine_prompt = f"""Return 9 random indices in a 9x9 array. Your output should only contain a list which contains each index as a sublist with no additional text. 
    Output sample / format: [[0,7],[1,2],[3,3],[3,7],[4,5],[5,5],[6,0],[7,7],[8,8],[9,3]]
    """

    mine_indices = get_completion_from_messages(mine_prompt)
    print(mine_indices)

    for i in range(9):
        for j in range(9):
            index_str1 = f"[{i},{j}]"
            index_str2 = f"[{i}, {j}]"
            if index_str1 in mine_indices or index_str2 in mine_indices:
                mine_grid[i][j] = 'M'

    for i in range(9):
        for j in range(9):
            if mine_grid[i][j] != 'M':
                mine_count = 0
                for dx in [-1, 0, 1]:
                    for dy in [-1, 0, 1]:
                        if dx == 0 and dy == 0:
                            continue 
                        ni, nj = i + dy, j + dx
                        if 0 <= ni < 9 and 0 <= nj < 9 and mine_grid[ni][nj] == 'M':
                            mine_count += 1
                mine_grid[i][j] = mine_count

@app.route("/")
def home():
    create_mine_grid()
    for row in mine_grid:
        print(row)
    print("-"*50)
    return render_template("index.html")

@app.route('/handle_click', methods=['POST'])
def handle_click():
    data = request.get_json()
    button_name = data.get('button')

    row = int(button_name[0])
    col = int(button_name[1])
    is_mine = mine_grid[row][col] 

    if is_mine == 'M':
        return jsonify(message="M")
    elif is_mine == 0:
        return jsonify(message="0")
    else:
        return jsonify(message=str(is_mine))

if __name__ == "__main__":
    app.run(debug=True)
