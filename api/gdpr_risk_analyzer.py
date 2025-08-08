import pyodbc
import pandas as pd
import re
import io
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import pyodbc
import matplotlib.pyplot as plt
import pandas as pd
import io
from utils import get_connection_string

def extract_schema_metadata(database_name: str) -> pd.DataFrame:
    """
    Extract schema metadata from the specified database
    """
    try:
        connection_string = get_connection_string(database_name)
        conn = pyodbc.connect(connection_string)
        
        # Query to get metadata + primary keys
        query = """
        SELECT 
            c.TABLE_NAME,
            c.COLUMN_NAME,
            c.DATA_TYPE,
            CASE WHEN k.COLUMN_NAME IS NOT NULL THEN 1 ELSE 0 END AS IS_PRIMARY_KEY
        FROM INFORMATION_SCHEMA.COLUMNS c
        LEFT JOIN (
            SELECT TABLE_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        ) k
        ON c.TABLE_NAME = k.TABLE_NAME AND c.COLUMN_NAME = k.COLUMN_NAME
        ORDER BY c.TABLE_NAME, c.ORDINAL_POSITION;
        """
        
        df_schema = pd.read_sql(query, conn)
        conn.close()
        
        return df_schema
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting schema: {str(e)}")

def perform_gdpr_analysis(df_schema: pd.DataFrame, database_name: str) -> pd.DataFrame:
    """
    Perform GDPR analysis on the schema metadata
    """
    try:
        # Keywords for identifying risks
        personal_keywords = ['name', 'email', 'birth', 'ssn', 'phone']
        sensitive_keywords = ['medical', 'diagnosis', 'religion', 'ethnicity', 'sexual', 'biometric']
        timestamp_keywords = ['created', 'updated', 'deleted']

        # Risk assessment function
        def assess_risk(row):
            col = row['COLUMN_NAME'].lower()
            risk_level = "Low"
            gdpr_category = "Non-Personal"
            compliance_status = "Compliant"
            recommendation = "No action required"

            if any(k in col for k in personal_keywords):
                risk_level = "Medium"
                gdpr_category = "Personal Data"
                compliance_status = "Partially Compliant"
                recommendation = "Consider data minimization and encryption"

            if any(k in col for k in sensitive_keywords):
                risk_level = "High"
                gdpr_category = "Special Category Data"
                compliance_status = "Non-Compliant"
                recommendation = "Requires explicit consent and enhanced protection"

            if row['IS_PRIMARY_KEY'] == 1 and any(k in col for k in personal_keywords):
                risk_level = "Medium"
                gdpr_category = "Personal Identifier"
                compliance_status = "Partially Compliant"
                recommendation = "Primary key contains personal data - review necessity"

            if any(k in col for k in timestamp_keywords):
                recommendation = "Contains timestamp - good for audit trail"

            return pd.Series([risk_level, gdpr_category, compliance_status, recommendation])

        df_schema[['risk_level', 'gdpr_category', 'compliance_status', 'recommendation']] = df_schema.apply(assess_risk, axis=1)

        # Rename columns to match frontend expectations
        df_schema = df_schema.rename(columns={
            'TABLE_NAME': 'table_name',
            'COLUMN_NAME': 'column_name',
            'DATA_TYPE': 'data_type',
            'IS_PRIMARY_KEY': 'is_primary_key'
        })

        # Extract sample values (your existing code)
        connection_string = get_connection_string(database_name)
        conn = pyodbc.connect(connection_string)
        
        sample_values = []
        limited_df = df_schema.head(50)
        
        for _, row in limited_df.iterrows():
            try:
                table = row['table_name']
                column = row['column_name']
                query = f"SELECT TOP 3 [{column}] FROM [{table}] WHERE [{column}] IS NOT NULL"
                cursor = conn.cursor()
                cursor.execute(query)
                values = [str(r[0]) for r in cursor.fetchall()]
                sample_values.append(", ".join(values))
            except:
                sample_values.append("N/A")
        
        while len(sample_values) < len(df_schema):
            sample_values.append("N/A")
            
        conn.close()
        df_schema['sample_values'] = sample_values

        return df_schema
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error performing GDPR analysis: {str(e)}")

def generate_gdpr_pdf_report(df_analysis: pd.DataFrame, database_name: str) -> bytes:
    """
    Generate PDF report from GDPR analysis results
    """
    try:
        # Select useful columns
        columns_to_include = ['TABLE_NAME', 'COLUMN_NAME', 'DATA_TYPE', 'IS_PRIMARY_KEY', 'RISK_LEVEL']
        df = df_analysis[columns_to_include].copy()
        df = df.fillna("")  # Avoid issues with NaN

        # Convert everything to strings
        data = [list(df.columns)] + df.astype(str).values.tolist()

        # Create PDF in memory
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4)
        styles = getSampleStyleSheet()
        
        elements = [
            Paragraph(f"GDPR Risk Report – Database Schema", styles["Heading1"]),
            Paragraph(f"Database: {database_name}", styles["Heading2"])
        ]

        # Create table
        table = Table(data, repeatRows=1)

        # Base style
        style = TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.25, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ])

        # Apply colors for risk levels (row by row)
        for i, row in enumerate(df.itertuples(), start=1):  # +1 to skip header
            risk = row.RISK_LEVEL.strip()
            if "Critico" in risk:
                bg_color = colors.HexColor("#ffcccc")  # light red
            elif "Medio" in risk:
                bg_color = colors.HexColor("#fff2cc")  # light yellow
            elif "Basso" in risk:
                bg_color = colors.HexColor("#ccffcc")  # light green
            else:
                bg_color = colors.white

            style.add('BACKGROUND', (0, i), (-1, i), bg_color)

        table.setStyle(style)
        elements.append(table)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return buffer.getvalue()
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating PDF report: {str(e)}")

# FastAPI endpoint function that combines all three steps
def create_gdpr_report(database_name: str = "AdventureWorks2019") -> StreamingResponse:
    """
    Complete GDPR analysis pipeline that returns a PDF report
    """
    try:
        # Step 1: Extract schema metadata
        schema_df = extract_schema_metadata(database_name)
        
        # Step 2: Perform GDPR analysis
        analysis_df = perform_gdpr_analysis(schema_df, database_name)
        
        # Step 3: Generate PDF report
        pdf_bytes = generate_gdpr_pdf_report(analysis_df, database_name)
        
        # Return PDF as streaming response
        pdf_buffer = io.BytesIO(pdf_bytes)
        
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=gdpr_report_{database_name}.pdf"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating GDPR report: {str(e)}")
    

def generate_chart(database_name: str) -> io.BytesIO:

    connection_string = get_connection_string(database_name)
    conn = pyodbc.connect(connection_string)
    cursor = conn.cursor()

    # Generate months from 2021-01-01 to 2023-12-01
    query = """
    WITH Months AS (
        SELECT CAST('2021-01-01' AS DATE) AS MonthStart
        UNION ALL
        SELECT DATEADD(MONTH, 1, MonthStart)
        FROM Months
        WHERE MonthStart < '2023-12-01'
    )
    SELECT
        MonthStart,
        (SELECT COUNT(*) FROM Person.Person) AS TotalRows,
        (SELECT COUNT(*) FROM Person.Person WHERE ModifiedDate < DATEADD(YEAR, -10, MonthStart)) AS OlderThan10Years
    FROM Months
    ORDER BY MonthStart
    OPTION (MAXRECURSION 1000);
    """

    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    # Process data
    data = []
    for row in rows:
        month = row.MonthStart
        total = row.TotalRows
        older = row.OlderThan10Years
        pct = (older / total * 100) if total > 0 else 0
        data.append({'Month': month, 'PercentageOlderThan10Years': pct})

    df = pd.DataFrame(data)

    # Create the bar chart
    plt.figure(figsize=(12, 8))
    months_short = [m.strftime('%Y-%m') for m in df['Month']]
    bars = plt.bar(range(len(df)), df['PercentageOlderThan10Years'], 
                    color='skyblue', edgecolor='navy', alpha=0.8, linewidth=1)
    plt.title('Monthly Growth of Records Passing the 10-Year Age Threshold', fontsize=14, fontweight='bold')
    plt.xlabel('Month', fontsize=12)
    plt.ylabel('Percentage (%)', fontsize=12)
    plt.xticks(range(0, len(df), 3), [months_short[i] for i in range(0, len(df), 3)], rotation=45)

    plt.grid(True, alpha=0.3)
    plt.tight_layout()

    # Save to memory instead of file
    img_buffer = io.BytesIO()
    plt.savefig(img_buffer, format='png', dpi=300, bbox_inches='tight')
    img_buffer.seek(0)
    plt.close()  # Free memory

    return img_buffer