import React, { memo, Suspense, useRef } from 'react';
import { Skeleton } from 'antd';
import InputText from '@volenday/input-text';
import striptags from 'striptags';
import { Controller, useForm } from 'react-hook-form';

const browser = typeof process.browser !== 'undefined' ? process.browser : true;

export default props => {
	const {
		editable = false,
		stripHTMLTags = false,
		format = [],
		id,
		multiple = false,
		onChange,
		richText,
		...defaultProps
	} = props;

	return {
		...defaultProps,
		Cell: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Cell {...props} other={{ editable, format, id, multiple, onChange, richText, stripHTMLTags }} />
				</Suspense>
			) : null,
		Filter: props =>
			browser ? (
				<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
					<Filter {...props} />
				</Suspense>
			) : null
	};
};

const Cell = memo(
	({ row: { original }, other: { editable, format, id, multiple, onChange, richText, stripHTMLTags }, value }) => {
		if (typeof value === 'undefined') return null;

		if (editable && !multiple && !richText) {
			const formRef = useRef();
			const originalValue = value;
			const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });
			const onSubmit = values => onChange({ ...values, Id: original.Id });

			return (
				<form onSubmit={handleSubmit(onSubmit)} ref={formRef} style={{ width: '100%' }}>
					<Controller
						control={control}
						name={id}
						render={({ onChange, value, name }) => (
							<InputText
								format={format}
								id={name}
								onBlur={() =>
									originalValue !== value &&
									formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))
								}
								onChange={e => onChange(e.target.value)}
								onPressEnter={e => e.target.blur()}
								withLabel={false}
								value={value}
							/>
						)}
					/>
				</form>
			);
		}

		if (format.length !== 0) {
			const Cleave = require('cleave.js/react');

			let blocks = format.map(d => parseInt(d.characterLength)),
				delimiters = format.map(d => d.delimiter);
			delimiters.pop();

			return (
				<div>
					<Cleave
						disabled={true}
						options={{ delimiters, blocks }}
						value={value}
						style={{ border: 'none', backgroundColor: 'transparent' }}
					/>
				</div>
			);
		}

		return <span>{stripHTMLTags ? striptags(value) : value}</span>;
	}
);

const Filter = memo(({ column: { filterValue, setFilter } }) => {
	let timeout = null;

	const formRef = useRef();
	const { control, handleSubmit } = useForm({ defaultValues: { filter: filterValue ? filterValue : '' } });
	const onSubmit = values => setFilter(values.filter);

	return (
		<form onSubmit={handleSubmit(onSubmit)} ref={formRef} style={{ width: '100%' }}>
			<Controller
				control={control}
				name="filter"
				render={({ onChange, value, name }) => (
					<InputText
						id={name}
						onChange={e => {
							onChange(e.target.value);
							if (value !== '' && e.target.value === '') {
								formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
							} else {
								timeout && clearTimeout(timeout);
								timeout = setTimeout(
									() => formRef.current.dispatchEvent(new Event('submit', { cancelable: true })),
									1000
								);
							}
						}}
						onPressEnter={() => formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))}
						placeholder="Search..."
						withLabel={false}
						value={value}
					/>
				)}
			/>
		</form>
	);
});
