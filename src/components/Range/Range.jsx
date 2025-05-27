import "./Range.css";

function Range(props) {
    const { range, name } = props;

    const percentage = (r) => {
        return `${(r * 100) / 255}%`
    }

    const color = () => {
        if (range < 40) {
            return 'red';
        } else if (range >= 40 & range < 50) {
            return 'tomato';
        } else if (range >= 50 & range < 80) {
            return 'sandybrown';
        } else if (range >= 80 & range < 100) {
            return 'gold';
        } else if (range >= 100 & range < 120) {
            return 'forestgreen';
        } else if (range >= 120) {
            return 'lime';
        } else {
            return 'lightgray'
        }
    }

    return (
        <div className="range-container">
            <span className="stat-name">{name.replace('-', ' ')}</span>
            <span className="stat-number">{range}</span>
            <div className="range-wrap">
                <div className="range-bar" style={{ width: percentage(range), backgroundColor: color() }}></div>
            </div>
        </div>
    );
}

export default Range;