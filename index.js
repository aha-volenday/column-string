import React, { memo, Suspense, useRef } from 'react';
import { Skeleton } from 'antd';
import InputText from '@volenday/input-text';
import striptags from 'striptags';
import { Controller, useForm } from 'react-hook-form';

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
		Cell: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Cell {...props} other={{ editable, format, id, multiple, onChange, richText, stripHTMLTags }} />
			</Suspense>
		),
		Filter: props => (
			<Suspense fallback={<Skeleton active={true} paragraph={null} />}>
				<Filter {...props} />
			</Suspense>
		)
	};
};

const Cell = memo(
	({ row: { original }, other: { editable, format, id, multiple, onChange, richText, stripHTMLTags }, value }) => {
		if (typeof value === 'undefined') return null;

		if (editable && !multiple && !richText) {
			const formRef = useRef();
			const { control, handleSubmit } = useForm({ defaultValues: { [id]: value } });
			const onSubmit = values => onChange({ ...values, Id: original.Id });

			return (
				<form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
					<Controller
						control={control}
						name={id}
						render={({ onChange, value, name }) => (
							<InputText
								format={format}
								id={name}
								onBlur={() => formRef.current.dispatchEvent(new Event('submit', { cancelable: true }))}
								onChange={onChange}
								onPressEnter={e => {
									e.target.blur();
								}}
								withLabel={false}
								value={value}
							/>
						)}
					/>
				</form>
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
		<form onSubmit={handleSubmit(onSubmit)} ref={formRef}>
			<Controller
				control={control}
				name="filter"
				render={({ onChange, value, name }) => (
					<InputText
						id={name}
						onChange={e => {
							onChange(e);
							if (value !== '' && e.target.value === '') {
								formRef.current.dispatchEvent(new Event('submit', { cancelable: true }));
							} else {
								timeout && clearTimeout(timeout);
								timeout = setTimeout(
									() => formRef.current.dispatchEvent(new Event('submit', { cancelable: true })),
									300
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
