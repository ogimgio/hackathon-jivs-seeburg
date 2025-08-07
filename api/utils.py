import pyodbc
from cryptography.fernet import Fernet

# === SQL Server Configuration ===
server = 'sql-lakeside-server.database.windows.net'
username = 'hackathon_beta'
password = 'Rn4&qT7!zM3s'

def get_connection_string(database):
    return (
        'DRIVER={ODBC Driver 18 for SQL Server};'
        f'SERVER={server};'
        f'DATABASE={database};'
        f'UID={username};'
        f'PWD={password};'
        'Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;'
    )

def encrypt_name(name:str):
    """Encrypt both names with the same key"""
    key = Fernet.generate_key()
    f = Fernet(key)
    encrypted_name = f.encrypt(name.encode()).decode()
    return encrypted_name, key.decode()

def insert_into_results_table(entity_id: str, processed_name: str,
                            encrypt_key: str, source: str, probability: float):
    """Insert processed data into Results.dbo.identified_names_team_beta"""
    try:
        conn = pyodbc.connect(get_connection_string('Results'))
        cursor = conn.cursor()
        insert_query = """
            INSERT INTO dbo.identified_names_team_beta 
                ([key], encrypt_key, source, name, probability)
            VALUES (?, ?, ?, ?, ?)
        """
        # Combine first and last name for the 'name' field
        full_name = processed_name
        cursor.execute(insert_query, (entity_id, encrypt_key, source, full_name, probability))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Insert failed: {e}")
        return False