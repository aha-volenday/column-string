import React, { memo, useEffect, useState } from 'react';
import { Button, Checkbox, Divider, Input, List, Popover } from 'antd';
import { FilterFilled, FilterOutlined } from '@ant-design/icons';
import striptags from 'striptags';

const Filter = ({ column, id, list, setFilter }) => {
	const [selected, setSelected] = useState([]);
	const [newOptions, setNewOptions] = useState(['(Blank)', ...list]);
	const [isPopoverVisible, setIsPopoverVisible] = useState(false);
	const [sort, setSort] = useState('');

	const withFilterValue = column.filterValue ? (column.filterValue.length !== 0 ? true : false) : false;

	useEffect(() => {
		if (!!column.filterValue) setSelected(column.filterValue.map(d => (d === '' ? '(Blank)' : d)));
	}, [JSON.stringify(column.filterValue)]);

	useEffect(() => {
		setSort(column.isSorted ? (column.isSortedDesc ? 'DESC' : 'ASC') : '');
	}, [column.isSorted, column.isSortedDesc]);

	const selectItem = value => {
		if (selected.includes(value)) setSelected(selected.filter(d => d !== value));
		else setSelected([...selected, value]);
	};

	const renderItem = item => {
		const text = striptags(item);

		const finalValue =
			text.length >= 90 ? (
				<div>
					{text.substr(0, 90).trim()}...
					<Popover
						content={
							<>
								<div dangerouslySetInnerHTML={{ __html: text }} />
								<br />
							</>
						}
						trigger="hover"
						placement="top"
						style={{ width: 350 }}>
						<Button
							type="link"
							onClick={e => e.stopPropagation()}
							size="small"
							style={{ lineHeight: 0.5, marginLeft: 10, padding: 0, height: 'auto' }}>
							<span style={{ color: '#1890ff' }}>show more</span>
						</Button>
					</Popover>
				</div>
			) : (
				text
			);

		return (
			<List.Item style={{ cursor: 'pointer', padding: '5px 0px' }}>
				<Checkbox
					checked={selected.includes(item)}
					onChange={() => selectItem(item)}
					style={{ textAlign: 'justify' }}>
					{finalValue}
				</Checkbox>
			</List.Item>
		);
	};

	const renderCount = () => {
		if (!column.filterValue) return null;
		if (!Array.isArray(column.filterValue)) return null;
		if (column.filterValue.length === 0) return null;
		return <span>({column.filterValue.length})</span>;
	};

	const handleSearch = value => {
		if (value === '') return setNewOptions(list);
		setNewOptions(list.filter(d => d.match(new RegExp(value, 'i'))));
	};

	const onOk = () => {
		setFilter(
			id,
			selected.map(d => (d === '(Blank)' ? '' : d))
		);
		if (sort) column.toggleSortBy(sort === 'ASC' ? true : sort === 'DESC' ? false : '');
		else column.clearSortBy();
	};

	const renderPopoverContent = () => {
		const a2zType = sort === 'ASC' ? 'primary' : 'default',
			z2aType = sort === 'DESC' ? 'primary' : 'default';
		return (
			<>
				<div>
					<h4>Sort</h4>
					<Button
						onClick={() => (sort !== 'ASC' ? setSort('ASC') : setSort(''))}
						type={a2zType}
						style={{ width: '49%' }}>
						A to Z
					</Button>
					<Button
						onClick={() => (sort !== 'DESC' ? setSort('DESC') : setSort(''))}
						type={z2aType}
						style={{ marginLeft: '2%', width: '49%' }}>
						Z to A
					</Button>
				</div>
				<Divider />
				<div>
					<h4>Filter {renderCount()}</h4>
					<Input.Search
						allowClear
						onKeyUp={e => handleSearch(e.target.value)}
						onSearch={handleSearch}
						placeholder="Search"
					/>
					<List
						dataSource={newOptions}
						renderItem={renderItem}
						style={{ height: 350, overflowY: 'scroll' }}
					/>
				</div>
				<Divider />
				<div>
					<h4>Column Settings</h4>
					<Checkbox {...column.getToggleHiddenProps()}>Visible</Checkbox>
				</div>
				<Divider />
				<div style={{ display: 'flex', justifyContent: 'flex-end' }}>
					<div
						style={{
							display: 'flex',
							justifyContent: 'space-between',
							width: '50%'
						}}>
						<Button onClick={closePopover} type="default">
							Cancel
						</Button>
						<Button onClick={onOk} type="primary">
							OK
						</Button>
					</div>
				</div>
			</>
		);
	};

	const openPopover = () => setIsPopoverVisible(true);
	const closePopover = () => setIsPopoverVisible(false);

	return (
		<Popover content={renderPopoverContent} trigger="click" visible={isPopoverVisible}>
			{withFilterValue ? (
				<FilterFilled onClick={openPopover} style={{ cursor: 'pointer' }} />
			) : (
				<FilterOutlined onClick={openPopover} style={{ cursor: 'pointer' }} />
			)}
		</Popover>
	);
};

export default memo(Filter);
