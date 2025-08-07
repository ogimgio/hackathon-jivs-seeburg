from smolagents import tool, CodeAgent, LiteLLMModel
import pyodbc
import os
import time
import multiprocessing
from concurrent.futures import ThreadPoolExecutor, as_completed
from dotenv import load_dotenv  # <-- NEW

load_dotenv()  # Load environment variables from .env file

SERVER = 'sql-lakeside-server.database.windows.net'
USERNAME = 'hackathon_beta'
PASSWORD = 'Rn4&qT7!zM3s'

# Fixed list of known searchable columns
SEARCH_TARGETS = [
    {"database": "ORACLE_EBS_HACK", "schema": "dbo", "table": "AR_HZ_PARTIES", "column": "PARTY_NAME"},
    {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "KNA1", "column": "NAME1"},
    {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "ADRC", "column": "NAME1"},
    {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "ADRC", "column": "MC_NAME1"},
    {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "ADRP", "column": "NAME_TEXT"},
]

def get_db_connection(database_name):
    return pyodbc.connect(
        f"DRIVER={{ODBC Driver 18 for SQL Server}};"
        f"SERVER={SERVER};"
        f"DATABASE={database_name};"
        f"UID={USERNAME};"
        f"PWD={PASSWORD}"
    )

# ---------- TOOL: Query matches only in predefined target columns ----------
@tool
def query_name_matches(name: str) -> list:
    """
    Search for a name in predefined database.table.column targets using fast collation search.

    Args:
        name (str): Name to search for.

    Returns:
        list: Matching rows with metadata.
    """
    # Use fixed list of known columns
    targets = [
        {"database": "ORACLE_EBS_HACK", "schema": "dbo", "table": "AR_HZ_PARTIES", "column": "PARTY_NAME"},
        {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "KNA1", "column": "NAME1"},
        {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "ADRC", "column": "NAME1"},
        {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "ADRC", "column": "MC_NAME1"},
        {"database": "ECC60jkl_HACK", "schema": "dbo", "table": "ADRP", "column": "NAME_TEXT"},
    ]

    results = []

    def query_single(entry):
        db, schema, table, column = entry["database"], entry["schema"], entry["table"], entry["column"]
        try:
            conn = get_db_connection(db)
            cursor = conn.cursor()

            query = f"""
            SELECT * FROM [{schema}].[{table}]
            WHERE [{column}] COLLATE Latin1_General_CI_AI LIKE ?
            """
            start_time = time.time()
            cursor.execute(query, (f"%{name}%",))
            rows = cursor.fetchall()
            elapsed = time.time() - start_time
            columns = [desc[0] for desc in cursor.description]
            conn.close()

            if rows:
                print(f"✔ Found {len(rows)} match(es) in {db}.{schema}.{table}.{column} [{elapsed:.2f}s]")

            return [
                {
                    "database": db,
                    "schema": schema,
                    "table": table,
                    "column": column,
                    "row": dict(zip(columns, row))
                }
                for row in rows
            ]

        except Exception as e:
            print(f"⚠️ Error querying {db}.{schema}.{table}.{column}: {e}")
            return []

    max_threads = min(32, (multiprocessing.cpu_count() or 1) * 2)
    print(f"🚀 Using {max_threads} threads for querying...")
    with ThreadPoolExecutor(max_workers=max_threads) as executor:
        futures = [executor.submit(query_single, entry) for entry in targets]

        for future in as_completed(futures):
            results.extend(future.result())

    print(f"✅ Total matches found: {len(results)}")
    return results

def run_agent_for_names():

    # ---------- SETUP AGENT ----------
    model = LiteLLMModel(model_id="gpt-4o")

    agent = CodeAgent(
        tools=[query_name_matches],
        model=model,
        max_steps=3
    )

    name_input = "Paula Erickson"
    prompt = f"Find all rows in the known relevant tables where a column like name matches '{name_input}'"
    result = agent.run(prompt)
    return result

# ---------- RUN AGENT ----------
if __name__ == "__main__":
    try: 
        run_agent_for_names()
    except Exception as e:
        print(f"Error running agent: {e}")
    
