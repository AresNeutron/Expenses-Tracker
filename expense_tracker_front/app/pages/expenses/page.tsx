"use client";

import React, { useEffect } from "react";
import { useTable, Column } from "react-table";
import { useExpenseContext } from "@/app/components/Context";
import EditableCell from "@/app/components/EditableCell";
import { Expense } from "@/app/utils/interfaces";

const ExpensesPage: React.FC = () => {
  const { data, setData, deleteExpense, updateExpense, fetchExpenses } =
    useExpenseContext();

  const updateCellExpense = (
    rowIndex: number,
    columnId: string,
    value: string | number | boolean
  ) => {
    const id = data[rowIndex].id;
    updateExpense(id, { ...data[rowIndex], [columnId]: value });
  };

  useEffect(() => {
    fetchExpenses();
  }, [setData]);

  const columns: Column<Expense>[] = React.useMemo(
    () => [
      {
        Header: "Date",
        accessor: "date",
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateExpense={updateCellExpense}
            editable={true}
            identifier="description"
          />
        ),
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateExpense={updateCellExpense}
            editable={true}
            identifier="amount"
          />
        ),
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: (props) => (
          <EditableCell
            {...props}
            updateExpense={updateCellExpense}
            editable={true}
            identifier="category"
          />
        ),
      },
      {
        Header: "Actions",
        id: "actions",
        Cell: ({ row }) => {
          return (
            <button
              onClick={() => row && deleteExpense(row.original.id)}
              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
            >
              Delete
            </button>
          );
        },
      },
    ],
    [data]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-azul">Expenses</h1>
      <div className="flex justify-between mb-2 text-azul text-xl font-bold">
        <h2>
          Total Spent: ${" "}
          {data.reduce(
            (acc, el) => acc + (el.is_expense ? parseFloat(el.amount) : 0),
            0
          )}
        </h2>
        <h2>
          Total Earned: $
          {data.reduce(
            (acc, el) => acc + (!el.is_expense ? parseFloat(el.amount) : 0),
            0
          )}
        </h2>
      </div>

      <table {...getTableProps()} className="border-2 border-azul w-full">
        <thead>
          {headerGroups.map((headerGroup, headerGroupIndex) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={`headerGroup-${headerGroupIndex}`}
            >
              {headerGroup.headers.map((column, columnIndex) => (
                <th
                  className="bg-azul text-white text-lg p-2"
                  {...column.getHeaderProps()}
                  key={`column-${columnIndex}`}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, rowIndex) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={`row-${rowIndex}`}>
                {row.cells.map((cell, cellIndex) => (
                  <td
                    className="border-2 border-azul text-azul text-lg text-center p-1"
                    {...cell.getCellProps()}
                    key={`cell-${rowIndex}-${cellIndex}`}
                  >
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpensesPage;
