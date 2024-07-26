import {
    DateField,
    DeleteButton,
    EditButton,
    List,
    MarkdownField,
    ShowButton,
    useTable,
} from "@refinedev/antd";
import { type BaseRecord, useGetIdentity, useMany } from "@refinedev/core";
import { Button, Space, Table } from "antd";
import React, { useEffect } from "react";
import { socket, PeerConnection } from '../../communication'

export const CallList = () => {
    const me = useGetIdentity()
    
    const { tableProps, tableQueryResult: { refetch } } = useTable({
        syncWithLocation: true,
        meta: {
            select: '*, Agent(id_user)',
        },
        filters: {
            permanent: [
                {
                    field: 'is_active',
                    operator: 'eq',
                    value: true
                }
            ]
        }
    });

    useEffect(() => {
        const intervalID = setInterval(refetch, 10000)
        socket.on('maganak', (res) => {
            console.log("recv magabak ", res)
        })
        return () => clearInterval(intervalID)
    }, [])
    
    return (
        <List>
            <Table {...tableProps} rowKey="id">
                <Table.Column dataIndex="id" title={"ID"} />
                <Table.Column
                    dataIndex={["created_at"]}
                    title={"Date"}
                    render={(value: any) => <DateField value={value} />}
                />
                {/* <Table.Column
                    dataIndex={"categories"}
                    title={"Category"}
                    render={(value) =>
                            categoryIsLoading ? (
                                <>Loading...</>
                            ) : (
                                categoryData?.data?.find(
                                    (item) => item.id === value?.id,
                                )?.title    
                            )
                    }
                /> */}
                <Table.Column dataIndex="status" title={"Status"} />
                <Table.Column
                    title={"Actions"}
                    dataIndex="actions"
                    render={(_, record: BaseRecord) => (
                        <>
                            {
                                record.status == 'pending' ? <>
                                    <Button
                                        color="red.500"
                                    >Prendre le call</Button>
                                </> : (
                                    <>
                                    <Space>
                                        <ShowButton
                                            hideText
                                            size="small"
                                            recordItemId={record.id}
                                        />
                                        <DeleteButton
                                            hideText
                                            size="small"
                                            recordItemId={record.id}
                                        />
                                    </Space>
                                    </>
                                )
                            }
                        </>
                    )}
                />
            </Table>
        </List>
    );
};
